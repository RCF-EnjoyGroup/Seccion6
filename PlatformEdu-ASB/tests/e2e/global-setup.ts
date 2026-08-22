import { test as setup } from '@playwright/test';

const INSTRUCTOR_EMAIL = process.env.E2E_INSTRUCTOR_EMAIL || 'instructor@test.com';
const INSTRUCTOR_PASSWORD = process.env.E2E_INSTRUCTOR_PASSWORD || 'testpassword123';
const STUDENT_EMAIL = process.env.E2E_STUDENT_EMAIL || 'student@test.com';
const STUDENT_PASSWORD = process.env.E2E_STUDENT_PASSWORD || 'testpassword123';

async function createTestUser(email: string, password: string, fullName: string, role: string) {
  const response = await fetch('http://localhost:3000/api/test/create-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName, role }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to create user: ${data.error}`);
  }
  console.log(`Created/updated user: ${email}`);
  return data;
}

setup('ensure test users exist', async () => {
  await createTestUser(INSTRUCTOR_EMAIL, INSTRUCTOR_PASSWORD, 'Test Instructor', 'instructor');
  await createTestUser(STUDENT_EMAIL, STUDENT_PASSWORD, 'Test Student', 'student');
});