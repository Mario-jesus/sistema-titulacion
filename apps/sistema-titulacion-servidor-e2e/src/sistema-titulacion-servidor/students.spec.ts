import axios, { AxiosError } from 'axios';

const API = '/api/v1';

async function getAuthToken(): Promise<string> {
  const res = await axios.post(`${API}/auth/login`, {
    email: 'admin@example.com',
    password: 'password123',
  });
  return res.data.token;
}

function authHeaders(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

describe('Students API', () => {
  let token: string;
  let careerId: string;
  let generationId: string;
  const createdStudentIds: string[] = [];
  const ts = Date.now();

  beforeAll(async () => {
    token = await getAuthToken();

    const [careers, generations] = await Promise.all([
      axios.get(`${API}/careers?limit=1`, authHeaders(token)),
      axios.get(`${API}/generations?limit=1`, authHeaders(token)),
    ]);

    careerId = careers.data.data[0]?.id;
    generationId = generations.data.data[0]?.id;

    expect(careerId).toBeDefined();
    expect(generationId).toBeDefined();
  });

  afterAll(async () => {
    for (const id of createdStudentIds) {
      try {
        await axios.delete(`${API}/students/${id}`, authHeaders(token));
      } catch {
        // ignore cleanup errors
      }
    }
  });

  function buildStudentPayload(suffix: string | number = ts) {
    return {
      firstName: 'Test',
      paternalLastName: 'Student',
      maternalLastName: 'E2E',
      controlNumber: `T${suffix}`,
      email: `test.student.${suffix}@e2e.test`,
      birthDate: '2000-01-15',
      sex: 'MASCULINO' as const,
      careerId,
      generationId,
    };
  }

  describe('Authentication required', () => {
    it('GET /students without auth returns 401', async () => {
      try {
        await axios.get(`${API}/students`);
        fail('Should have thrown');
      } catch (err) {
        const error = err as AxiosError;
        expect(error.response?.status).toBe(401);
      }
    });
  });

  describe('List students', () => {
    it('GET /students returns 200 with data and pagination', async () => {
      const res = await axios.get(`${API}/students`, authHeaders(token));

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.data)).toBe(true);
      expect(res.data.pagination).toBeDefined();

      const { pagination } = res.data;
      expect(pagination).toEqual(
        expect.objectContaining({
          total: expect.any(Number),
          limit: expect.any(Number),
          totalPages: expect.any(Number),
          page: expect.any(Number),
          pagingCounter: expect.any(Number),
          hasPrevPage: expect.any(Boolean),
          hasNextPage: expect.any(Boolean),
        })
      );
    });
  });

  describe('CRUD operations', () => {
    let studentId: string;

    it('POST /students creates a student', async () => {
      const payload = buildStudentPayload();
      const res = await axios.post(
        `${API}/students`,
        payload,
        authHeaders(token)
      );

      expect(res.status).toBe(201);
      expect(res.data).toBeDefined();
      studentId = res.data.id ?? res.data._id;
      createdStudentIds.push(studentId);
    });

    it('GET /students/:id returns the created student', async () => {
      const res = await axios.get(
        `${API}/students/${studentId}`,
        authHeaders(token)
      );

      expect(res.status).toBe(200);
      expect(res.data).toEqual(
        expect.objectContaining({
          firstName: 'Test',
          paternalLastName: 'Student',
        })
      );
    });

    it('PUT /students/:id updates the student', async () => {
      const res = await axios.put(
        `${API}/students/${studentId}`,
        { ...buildStudentPayload(), firstName: 'Updated' },
        authHeaders(token)
      );

      expect(res.status).toBe(200);
      expect(res.data.firstName).toBe('Updated');
    });

    it('PATCH /students/:id partially updates the student', async () => {
      const res = await axios.patch(
        `${API}/students/${studentId}`,
        { maternalLastName: 'Patched' },
        authHeaders(token)
      );

      expect(res.status).toBe(200);
      expect(res.data.maternalLastName).toBe('Patched');
    });

    it('DELETE /students/:id deletes the student', async () => {
      const res = await axios.delete(
        `${API}/students/${studentId}`,
        authHeaders(token)
      );

      expect(res.status).toBe(200);

      const idx = createdStudentIds.indexOf(studentId);
      if (idx !== -1) createdStudentIds.splice(idx, 1);
    });
  });

  describe('Validation errors', () => {
    it('POST /students with missing firstName returns 400', async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { firstName, ...incomplete } = buildStudentPayload(`val${ts}`);
        await axios.post(`${API}/students`, incomplete, authHeaders(token));
        fail('Should have thrown');
      } catch (err) {
        const error = err as AxiosError<{ code?: string }>;
        expect(error.response?.status).toBe(400);
        expect(error.response?.data?.code).toBe('VALIDATION_ERROR');
      }
    });

    it('POST /students with duplicate controlNumber returns 409', async () => {
      const payload = buildStudentPayload(`dup${ts}`);

      const first = await axios.post(
        `${API}/students`,
        payload,
        authHeaders(token)
      );
      const firstId = first.data.id ?? first.data._id;
      createdStudentIds.push(firstId);

      try {
        await axios.post(`${API}/students`, payload, authHeaders(token));
        fail('Should have thrown');
      } catch (err) {
        const error = err as AxiosError<{ code?: string }>;
        expect(error.response?.status).toBe(409);
        expect(error.response?.data?.code).toBe('DUPLICATE_ERROR');
      }
    });
  });

  describe('Not found', () => {
    it('GET /students/:id with non-existent id returns 404', async () => {
      try {
        await axios.get(
          `${API}/students/000000000000000000000000`,
          authHeaders(token)
        );
        fail('Should have thrown');
      } catch (err) {
        const error = err as AxiosError<{ code?: string }>;
        expect(error.response?.status).toBe(404);
        expect(error.response?.data?.code).toBe('STUDENT_NOT_FOUND');
      }
    });
  });

  describe('Status transitions', () => {
    let studentId: string;

    beforeAll(async () => {
      const payload = buildStudentPayload(`status${ts}`);
      const res = await axios.post(
        `${API}/students`,
        payload,
        authHeaders(token)
      );
      studentId = res.data.id ?? res.data._id;
      createdStudentIds.push(studentId);
    });

    it('POST /students/:id/status with PAUSADO returns 200', async () => {
      const res = await axios.post(
        `${API}/students/${studentId}/status`,
        { status: 'PAUSADO' },
        authHeaders(token)
      );

      expect(res.status).toBe(200);
    });

    it('POST /students/:id/status with ACTIVO reactivates', async () => {
      const res = await axios.post(
        `${API}/students/${studentId}/status`,
        { status: 'ACTIVO' },
        authHeaders(token)
      );

      expect(res.status).toBe(200);
    });
  });

  describe('Egress operations', () => {
    let studentId: string;

    beforeAll(async () => {
      const payload = buildStudentPayload(`egress${ts}`);
      const res = await axios.post(
        `${API}/students`,
        payload,
        authHeaders(token)
      );
      studentId = res.data.id ?? res.data._id;
      createdStudentIds.push(studentId);
    });

    it('POST /students/:id/egress marks as egressed', async () => {
      const res = await axios.post(
        `${API}/students/${studentId}/egress`,
        {},
        authHeaders(token)
      );

      expect(res.status).toBe(200);
    });

    it('POST /students/:id/egress again returns 400 ALREADY_EGRESSED', async () => {
      try {
        await axios.post(
          `${API}/students/${studentId}/egress`,
          {},
          authHeaders(token)
        );
        fail('Should have thrown');
      } catch (err) {
        const error = err as AxiosError<{ code?: string }>;
        expect(error.response?.status).toBe(400);
        expect(error.response?.data?.code).toBe('ALREADY_EGRESSED');
      }
    });

    it('POST /students/:id/unegress reverses egress', async () => {
      const res = await axios.post(
        `${API}/students/${studentId}/unegress`,
        {},
        authHeaders(token)
      );

      expect(res.status).toBe(200);
    });
  });

  describe('Special list endpoints', () => {
    it('GET /students/in-progress returns 200 with data and pagination', async () => {
      const res = await axios.get(
        `${API}/students/in-progress`,
        authHeaders(token)
      );

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.data)).toBe(true);
      expect(res.data.pagination).toBeDefined();
    });

    it('GET /students/scheduled returns 200 with data and pagination', async () => {
      const res = await axios.get(
        `${API}/students/scheduled`,
        authHeaders(token)
      );

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.data)).toBe(true);
      expect(res.data.pagination).toBeDefined();
    });

    it('GET /students/graduated returns 200 with data and pagination', async () => {
      const res = await axios.get(
        `${API}/students/graduated`,
        authHeaders(token)
      );

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.data)).toBe(true);
      expect(res.data.pagination).toBeDefined();
    });
  });

  describe('Process status', () => {
    let studentId: string;

    beforeAll(async () => {
      const payload = buildStudentPayload(`process${ts}`);
      const res = await axios.post(
        `${API}/students`,
        payload,
        authHeaders(token)
      );
      studentId = res.data.id ?? res.data._id;
      createdStudentIds.push(studentId);

      await axios.post(
        `${API}/students/${studentId}/egress`,
        {},
        authHeaders(token)
      );
    });

    it('POST /students/:id/process-status sets IN_PROCESS', async () => {
      const res = await axios.post(
        `${API}/students/${studentId}/process-status`,
        { processStatus: 'IN_PROCESS' },
        authHeaders(token)
      );

      expect(res.status).toBe(200);
    });
  });
});
