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

describe('CapturedFields API', () => {
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
        await axios.delete(
          `${API}/captured-fields/student/${id}`,
          authHeaders(token)
        );
      } catch {
        // ignore
      }
      try {
        await axios.delete(`${API}/students/${id}`, authHeaders(token));
      } catch {
        // ignore
      }
    }
  });

  function buildStudentPayload(suffix: string | number = ts) {
    return {
      firstName: 'CF',
      paternalLastName: 'Test',
      maternalLastName: 'E2E',
      controlNumber: `CF${suffix}`,
      email: `cf.student.${suffix}@e2e.test`,
      birthDate: '2000-01-15',
      sex: 'MASCULINO' as const,
      careerId,
      generationId,
    };
  }

  describe('Authentication required', () => {
    it('GET /captured-fields/student/:id without auth returns 401', async () => {
      try {
        await axios.get(
          `${API}/captured-fields/student/000000000000000000000001`
        );
        fail('Should have thrown');
      } catch (err) {
        const error = err as AxiosError;
        expect(error.response?.status).toBe(401);
      }
    });
  });

  describe('CRUD and rules', () => {
    let studentId: string;

    it('POST /captured-fields creates record', async () => {
      const createRes = await axios.post(
        `${API}/students`,
        buildStudentPayload(`cf-create-${ts}`),
        authHeaders(token)
      );
      studentId = createRes.data.id ?? createRes.data._id;
      createdStudentIds.push(studentId);

      const res = await axios.post(
        `${API}/captured-fields`,
        {
          studentId,
          processDate: '2025-06-01',
          projectName: 'Proyecto E2E',
          company: 'Empresa SA',
        },
        authHeaders(token)
      );

      expect(res.status).toBe(201);
      expect(res.data.studentId).toBe(studentId);
      expect(res.data.processDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(res.data.projectName).toBe('Proyecto E2E');
    });

    it('GET /captured-fields/student/:id returns the record', async () => {
      const res = await axios.get(
        `${API}/captured-fields/student/${studentId}`,
        authHeaders(token)
      );

      expect(res.status).toBe(200);
      expect(res.data.studentId).toBe(studentId);
    });

    it('POST duplicate for same student returns 409 DUPLICATE_ERROR', async () => {
      try {
        await axios.post(
          `${API}/captured-fields`,
          {
            studentId,
            processDate: '2025-07-01',
            projectName: 'Otro',
            company: 'Otra',
          },
          authHeaders(token)
        );
        fail('Should have thrown');
      } catch (err) {
        const error = err as AxiosError<{ code?: string }>;
        expect(error.response?.status).toBe(409);
        expect(error.response?.data?.code).toBe('DUPLICATE_ERROR');
      }
    });

    it('DELETE /captured-fields/student/:id removes record', async () => {
      const res = await axios.delete(
        `${API}/captured-fields/student/${studentId}`,
        authHeaders(token)
      );

      expect(res.status).toBe(200);
      expect(res.data.message).toBeDefined();
    });

    it('GET missing captured-fields returns 404 CAPTURED_FIELDS_NOT_FOUND', async () => {
      try {
        await axios.get(
          `${API}/captured-fields/student/${studentId}`,
          authHeaders(token)
        );
        fail('Should have thrown');
      } catch (err) {
        const error = err as AxiosError<{ code?: string }>;
        expect(error.response?.status).toBe(404);
        expect(error.response?.data?.code).toBe('CAPTURED_FIELDS_NOT_FOUND');
      }
    });

    it('POST for PAUSADO student returns 400 INVALID_STUDENT_STATUS', async () => {
      const s = await axios.post(
        `${API}/students`,
        buildStudentPayload(`cf-pausa-${ts}`),
        authHeaders(token)
      );
      const sid = s.data.id ?? s.data._id;
      createdStudentIds.push(sid);

      await axios.post(
        `${API}/students/${sid}/status`,
        { status: 'PAUSADO' },
        authHeaders(token)
      );

      try {
        await axios.post(
          `${API}/captured-fields`,
          {
            studentId: sid,
            processDate: '2025-06-01',
            projectName: 'X',
            company: 'Y',
          },
          authHeaders(token)
        );
        fail('Should have thrown');
      } catch (err) {
        const error = err as AxiosError<{ code?: string }>;
        expect(error.response?.status).toBe(400);
        expect(error.response?.data?.code).toBe('INVALID_STUDENT_STATUS');
      }
    });

    it('PUT can reassign studentId when target has no captured-fields', async () => {
      const a = await axios.post(
        `${API}/students`,
        buildStudentPayload(`cf-a-${ts}`),
        authHeaders(token)
      );
      const b = await axios.post(
        `${API}/students`,
        buildStudentPayload(`cf-b-${ts}`),
        authHeaders(token)
      );
      const idA = a.data.id ?? a.data._id;
      const idB = b.data.id ?? b.data._id;
      createdStudentIds.push(idA, idB);

      await axios.post(
        `${API}/captured-fields`,
        {
          studentId: idA,
          processDate: '2025-01-10',
          projectName: 'P',
          company: 'C',
        },
        authHeaders(token)
      );

      const put = await axios.put(
        `${API}/captured-fields/student/${idA}`,
        { studentId: idB },
        authHeaders(token)
      );

      expect(put.status).toBe(200);
      expect(put.data.studentId).toBe(idB);

      try {
        await axios.get(
          `${API}/captured-fields/student/${idA}`,
          authHeaders(token)
        );
        fail('GET old studentId should 404');
      } catch (err) {
        const error = err as AxiosError<{ code?: string }>;
        expect(error.response?.status).toBe(404);
        expect(error.response?.data?.code).toBe('CAPTURED_FIELDS_NOT_FOUND');
      }

      const getNew = await axios.get(
        `${API}/captured-fields/student/${idB}`,
        authHeaders(token)
      );
      expect(getNew.status).toBe(200);
    });
  });
});
