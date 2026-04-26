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

describe('Graduations API', () => {
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
          `${API}/graduations/student/${id}`,
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
      firstName: 'GR',
      paternalLastName: 'Test',
      maternalLastName: 'E2E',
      controlNumber: `GR${suffix}`,
      email: `gr.student.${suffix}@e2e.test`,
      birthDate: '2000-01-15',
      sex: 'MASCULINO' as const,
      careerId,
      generationId,
    };
  }

  function committeeBody() {
    return {
      president: 'Presi',
      secretary: 'Secre',
      vocal: 'Vocal',
      substituteVocal: 'Supl',
    };
  }

  describe('Authentication required', () => {
    it('GET /graduations/student/:id without auth returns 401', async () => {
      try {
        await axios.get(`${API}/graduations/student/000000000000000000000001`);
        fail('Should have thrown');
      } catch (err) {
        const error = err as AxiosError;
        expect(error.response?.status).toBe(401);
      }
    });
  });

  describe('CRUD, graduate and ungraduate', () => {
    let studentId: string;

    it('creates graduation, egresses, graduates and ungraduates', async () => {
      const createRes = await axios.post(
        `${API}/students`,
        buildStudentPayload(`gr-flow-${ts}`),
        authHeaders(token)
      );
      studentId = createRes.data.id ?? createRes.data._id;
      createdStudentIds.push(studentId);

      const gradRes = await axios.post(
        `${API}/graduations`,
        {
          studentId,
          ...committeeBody(),
          notes: null,
        },
        authHeaders(token)
      );
      expect(gradRes.status).toBe(201);
      expect(gradRes.data.studentId).toBe(studentId);

      await axios.post(
        `${API}/students/${studentId}/egress`,
        {},
        authHeaders(token)
      );

      const gradPost = await axios.post(
        `${API}/graduations/${studentId}/graduate`,
        {},
        authHeaders(token)
      );
      expect(gradPost.status).toBe(200);

      const st = await axios.get(
        `${API}/students/${studentId}`,
        authHeaders(token)
      );
      expect(st.data.processStatus).toBe('GRADUATED');
      expect(st.data.hasIdCard).toBe(true);

      const ung = await axios.post(
        `${API}/graduations/${studentId}/ungraduate`,
        {},
        authHeaders(token)
      );
      expect(ung.status).toBe(200);
      expect(ung.data.graduationDate).toBeNull();

      const st2 = await axios.get(
        `${API}/students/${studentId}`,
        authHeaders(token)
      );
      expect(st2.data.processStatus).toBe('IN_PROCESS');
      expect(st2.data.hasIdCard).toBe(false);
    });

    it('POST duplicate graduation returns 409 DUPLICATE_ERROR', async () => {
      const s = await axios.post(
        `${API}/students`,
        buildStudentPayload(`gr-dup-a-${ts}`),
        authHeaders(token)
      );
      const a = s.data.id ?? s.data._id;
      createdStudentIds.push(a);

      await axios.post(
        `${API}/graduations`,
        { studentId: a, ...committeeBody() },
        authHeaders(token)
      );

      try {
        await axios.post(
          `${API}/graduations`,
          { studentId: a, ...committeeBody() },
          authHeaders(token)
        );
        fail('Should have thrown');
      } catch (err) {
        const error = err as AxiosError<{ code?: string }>;
        expect(error.response?.status).toBe(409);
        expect(error.response?.data?.code).toBe('DUPLICATE_ERROR');
      }
    });

    it('POST with invalid graduationOptionId returns 404 GRADUATION_OPTION_NOT_FOUND', async () => {
      const s = await axios.post(
        `${API}/students`,
        buildStudentPayload(`gr-opt-${ts}`),
        authHeaders(token)
      );
      const sid = s.data.id ?? s.data._id;
      createdStudentIds.push(sid);

      try {
        await axios.post(
          `${API}/graduations`,
          {
            studentId: sid,
            graduationOptionId: '000000000000000000000099',
            ...committeeBody(),
          },
          authHeaders(token)
        );
        fail('Should have thrown');
      } catch (err) {
        const error = err as AxiosError<{ code?: string }>;
        expect(error.response?.status).toBe(404);
        expect(error.response?.data?.code).toBe('GRADUATION_OPTION_NOT_FOUND');
      }
    });

    it('POST /graduate when not egressed returns 400 VALIDATION_ERROR', async () => {
      const s = await axios.post(
        `${API}/students`,
        buildStudentPayload(`gr-noeg-${ts}`),
        authHeaders(token)
      );
      const sid = s.data.id ?? s.data._id;
      createdStudentIds.push(sid);

      await axios.post(
        `${API}/graduations`,
        { studentId: sid, ...committeeBody() },
        authHeaders(token)
      );

      try {
        await axios.post(
          `${API}/graduations/${sid}/graduate`,
          {},
          authHeaders(token)
        );
        fail('Should have thrown');
      } catch (err) {
        const error = err as AxiosError<{ code?: string }>;
        expect(error.response?.status).toBe(400);
        expect(error.response?.data?.code).toBe('VALIDATION_ERROR');
      }
    });
  });
});
