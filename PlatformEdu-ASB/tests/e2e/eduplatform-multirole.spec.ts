import { test, expect, Page } from '@playwright/test';

const INSTRUCTOR_EMAIL = process.env.E2E_INSTRUCTOR_EMAIL || 'instructor@test.com';
const INSTRUCTOR_PASSWORD = process.env.E2E_INSTRUCTOR_PASSWORD || 'testpassword123';
const STUDENT_EMAIL = process.env.E2E_STUDENT_EMAIL || 'student@test.com';
const STUDENT_PASSWORD = process.env.E2E_STUDENT_PASSWORD || 'testpassword123';

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('[data-testid="login-email"]', email);
  await page.fill('[data-testid="login-password"]', password);
  
  // Click submit button and wait for navigation
  await Promise.all([
    page.waitForURL(/\/instructor|\/estudiante|\//, { timeout: 15000 }),
    page.click('[data-testid="login-submit"]'),
  ]);
  
  // Wait a bit for page to settle
  await page.waitForTimeout(1000);
  
  // Verify we're logged in
  await expect(page.locator('h1')).not.toContainText('Bienvenido de nuevo');
}

test.describe.serial('EduPlatform E2E - Full multi-role flow', () => {
  let createdCourseId: string;

  test('Instructor creates and publishes a free course', async ({ page }) => {
    await loginAs(page, INSTRUCTOR_EMAIL, INSTRUCTOR_PASSWORD);

    // Go to instructor dashboard
    await page.goto('/instructor/cursos');
    await expect(page.locator('h1')).toContainText('Mis cursos');

    // Click "Crear nuevo curso"
    await page.click('[data-testid="create-new-course"]');
    await expect(page).toHaveURL(/\/instructor\/cursos\/nuevo/);

    // Fill course form
    await page.fill('[data-testid="course-title-input"]', 'Curso E2E Playwright Gratis');
    await page.fill('[data-testid="course-short-desc-input"]', 'Curso de prueba creado por test E2E');
    await page.fill('[data-testid="course-desc-input"]', 'Este es un curso gratuito creado durante la prueba E2E automatizada para verificar el flujo completo de creación e inscripción.');

    // Select category
    await page.click('[data-testid="course-category-trigger"]');
    await page.click('[data-testid="course-category-Desarrollo Web"]');

    // Select level
    await page.click('[data-testid="course-level-trigger"]');
    await page.click('[data-testid="course-level-beginner"]');

    // Set price to 0 (free)
    await page.fill('[data-testid="course-price-input"]', '0');

    // Add thumbnail URL
    await page.fill('[data-testid="course-thumbnail-input"]', 'https://picsum.photos/seed/e2e-course/800/450');

    // Submit form
    await page.click('[data-testid="course-form-submit"]');

    // Should redirect to curriculum page
    await expect(page).toHaveURL(/\/instructor\/cursos\/[^/]+\/curriculum/, { timeout: 15000 });

    // Extract course ID from URL
    const url = page.url();
    const courseIdMatch = url.match(/\/instructor\/cursos\/([^/]+)\/curriculum/);
    expect(courseIdMatch).toBeTruthy();
    createdCourseId = courseIdMatch![1];

    // Go back to instructor courses list
    await page.goto('/instructor/cursos');

    // Find the created course and publish it
    const courseRow = page.locator(`[data-testid="instructor-course-${createdCourseId}"]`);
    await expect(courseRow).toBeVisible();

    // Add curriculum (section + lesson) via test API so the course can be published
    const curriculumResponse = await page.request.post('http://localhost:3000/api/test/add-curriculum', {
      data: { courseId: createdCourseId },
    });
    const curriculumData = await curriculumResponse.json();
    console.log('Curriculum API response:', curriculumData);
    if (!curriculumResponse.ok()) {
      throw new Error(`Failed to add curriculum: ${curriculumData.error}`);
    }

    // Wait for curriculum to be added
    await page.waitForTimeout(2000);

    // Click publish button
    await courseRow.locator('[data-testid="course-publish"]').click();

    // Wait for the publish action to complete
    await page.waitForTimeout(3000);

    // Verify course is published - refresh and check
    await page.reload();
    await expect(courseRow.locator(`[data-testid="course-status-${createdCourseId}"]`)).toContainText('Publicado', { timeout: 10000 });
  });

  test('Visitor browses catalog and uses filters', async ({ page }) => {
    // Go to courses catalog
    await page.goto('/cursos');
    await expect(page.locator('h1')).toContainText('Explorar cursos');

    // Verify search input works
    await page.fill('[data-testid="search-input"]', 'React');
    await page.waitForTimeout(500);

    // Clear search
    await page.fill('[data-testid="search-input"]', '');
    await page.waitForTimeout(500);

    // Test category filter
    await page.click('[data-testid="category-Desarrollo Web"]');
    await expect(page).toHaveURL(/category=Desarrollo/);

    // Test level filter
    await page.click('[data-testid="level-select-trigger"]');
    await page.click('[data-testid="level-beginner"]');
    await expect(page).toHaveURL(/level=beginner/);

    // Clear filters
    await page.click('[data-testid="category-all"]');
  });

  test('Visitor can access Edy widget page', async ({ page }) => {
    // Go to Edy agent page
    await page.goto('/agente-edy');
    await expect(page.locator('h1')).toContainText('Edy');

    // Verify Edy widget is present
    const edyWidget = page.locator('[data-testid="edy-widget"]');
    await expect(edyWidget).toBeVisible();

    // Check status
    const statusText = page.locator('[data-testid="edy-status-text"]');
    await expect(statusText).toBeVisible();
  });

  test('Student enrolls in the free course created by instructor', async ({ page }) => {
    await loginAs(page, STUDENT_EMAIL, STUDENT_PASSWORD);

    // Go to student dashboard first
    await page.goto('/estudiante');
    await expect(page.locator('h1')).toContainText('Mi aprendizaje');

    // Go to courses catalog
    await page.goto('/cursos');
    await expect(page.locator('h1')).toContainText('Explorar cursos');

    // Search for the course created by instructor
    await page.fill('[data-testid="search-input"]', 'Curso E2E Playwright Gratis');
    await page.waitForTimeout(500);

    // Click on the course card - find by exact title
    const courseCard = page.locator('[data-testid^="course-card-"]').filter({ hasText: 'Curso E2E Playwright Gratis' }).first();
    await expect(courseCard).toBeVisible({ timeout: 10000 });
    await courseCard.click();

    // On course detail page, verify we're there
    await expect(page.locator('h1')).toContainText('Curso E2E Playwright Gratis');

    // Check if course is published by looking at the price/enroll button
    const enrollButtonFree = page.locator('[data-testid="enroll-button-free"]');
    const enrollButtonPaid = page.locator('[data-testid="enroll-button-paid"]');
    const enrollButtonEnrolled = page.locator('[data-testid="enroll-button-enrolled"]');
    
    // Wait for one of the enroll buttons to appear
    await Promise.race([
      expect(enrollButtonFree).toBeVisible({ timeout: 15000 }),
      expect(enrollButtonPaid).toBeVisible({ timeout: 15000 }),
      expect(enrollButtonEnrolled).toBeVisible({ timeout: 15000 }),
    ]);

    // Click enroll button (free course)
    if (await enrollButtonFree.isVisible()) {
      await enrollButtonFree.click();
    } else if (await enrollButtonPaid.isVisible()) {
      throw new Error('Course is not published (shows paid button)');
    } else if (await enrollButtonEnrolled.isVisible()) {
      // Already enrolled - verify by checking student dashboard
      console.log('Student already enrolled, verifying enrollment...');
      await page.goto('/estudiante');
      await expect(page.locator('h2:has-text("En progreso")')).toBeVisible();
      const enrolledCourse = page.locator('a[href*="/cursos/"]').first();
      await expect(enrolledCourse).toBeVisible();
      return; // Test passes - already enrolled
    }

    // Should redirect to learning page or student dashboard
    await expect(page).toHaveURL(/\/aprender\/|\/estudiante/);

    // Verify enrollment by checking student dashboard
    await page.goto('/estudiante');
    await expect(page.locator('h2:has-text("En progreso")')).toBeVisible();

    // The enrolled course should appear in "En progreso"
    const enrolledCourse = page.locator('a[href*="/cursos/"]').first();
    await expect(enrolledCourse).toBeVisible();
  });

  test('Student cannot enroll twice in the same free course', async ({ page }) => {
    await loginAs(page, STUDENT_EMAIL, STUDENT_PASSWORD);

    // Go to courses catalog
    await page.goto('/cursos');

    // Search for the course
    await page.fill('[data-testid="search-input"]', 'Curso E2E Playwright Gratis');
    await page.waitForTimeout(500);

    // Click on the course card
    const courseCard = page.locator('[data-testid^="course-card-"]').filter({ hasText: 'Curso E2E Playwright Gratis' }).first();
    await expect(courseCard).toBeVisible({ timeout: 10000 });
    await courseCard.click();

    // On course detail page, the enroll button should show "Continuar aprendiendo" since already enrolled
    await expect(page.locator('[data-testid="enroll-button-enrolled"]')).toBeVisible({ timeout: 10000 });
  });
});