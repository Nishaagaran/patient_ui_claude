import { test, expect, Page } from '@playwright/test';

// ── Helpers ────────────────────────────────────────────────────────────────

async function fillForm(
  page: Page,
  {
    name = '',
    bmi,
    systolic,
    diastolic,
    glucose,
  }: {
    name?: string;
    bmi: string;
    systolic: string;
    diastolic: string;
    glucose: string;
  }
) {
  if (name) await page.getByPlaceholder('e.g. John Smith').fill(name);
  await page.getByPlaceholder('e.g. 22.5').fill(bmi);
  await page.getByPlaceholder('Systolic').fill(systolic);
  await page.getByPlaceholder('Diastolic').fill(diastolic);
  await page.getByPlaceholder('e.g. 95').fill(glucose);
}

async function analyse(page: Page) {
  await page.getByRole('button', { name: 'Analyse Health' }).click();
}

// ── Page load ──────────────────────────────────────────────────────────────

test.describe('Page load', () => {
  test('displays the application header', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Patient Health Analyser' })).toBeVisible();
    await expect(page.getByText('Enter patient vitals to assess health status')).toBeVisible();
  });

  test('shows the empty-state prompt on the dashboard before any input', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Enter patient vitals and click')).toBeVisible();
  });

  test('all input fields are present and empty', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByPlaceholder('e.g. John Smith')).toBeEmpty();
    await expect(page.getByPlaceholder('e.g. 22.5')).toBeEmpty();
    await expect(page.getByPlaceholder('Systolic')).toBeEmpty();
    await expect(page.getByPlaceholder('Diastolic')).toBeEmpty();
    await expect(page.getByPlaceholder('e.g. 95')).toBeEmpty();
  });

  test('reference ranges table is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Reference Ranges')).toBeVisible();
    await expect(page.getByText('18.5 – 24.9 Normal')).toBeVisible();
  });
});

// ── Validation ────────────────────────────────────────────────────────────

test.describe('Form validation', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/'); });

  test('shows all validation errors when form is submitted empty', async ({ page }) => {
    await analyse(page);
    await expect(page.getByText('Enter a valid BMI (e.g. 22.5)')).toBeVisible();
    await expect(page.getByText('Enter systolic BP')).toBeVisible();
    await expect(page.getByText('Enter diastolic BP')).toBeVisible();
    await expect(page.getByText('Enter a valid glucose level')).toBeVisible();
  });

  test('does not show dashboard when validation fails', async ({ page }) => {
    await analyse(page);
    await expect(page.getByText('Enter patient vitals and click')).toBeVisible();
  });

  test('clears errors after valid values are submitted', async ({ page }) => {
    await analyse(page);
    await expect(page.getByText('Enter a valid BMI (e.g. 22.5)')).toBeVisible();
    await fillForm(page, { bmi: '22', systolic: '115', diastolic: '75', glucose: '90' });
    await analyse(page);
    await expect(page.getByText('Enter a valid BMI (e.g. 22.5)')).not.toBeVisible();
  });
});

// ── Healthy scenario ──────────────────────────────────────────────────────

test.describe('Healthy classification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await fillForm(page, { bmi: '22', systolic: '115', diastolic: '75', glucose: '90' });
    await analyse(page);
  });

  test('overall banner shows Healthy status', async ({ page }) => {
    await expect(page.getByText('Overall Status')).toBeVisible();
    const banner = page.locator('.overall-status');
    await expect(banner).toContainText('Healthy');
  });

  test('BMI metric card shows Normal / healthy', async ({ page }) => {
    const cards = page.locator('.metric-card');
    const bmiCard = cards.nth(0);
    await expect(bmiCard).toContainText('22');
    await expect(bmiCard).toContainText('Normal');
  });

  test('Blood Pressure metric card shows Normal / healthy', async ({ page }) => {
    const cards = page.locator('.metric-card');
    const bpCard = cards.nth(1);
    await expect(bpCard).toContainText('115/75');
    await expect(bpCard).toContainText('Normal');
  });

  test('Glucose metric card shows Normal / healthy', async ({ page }) => {
    const cards = page.locator('.metric-card');
    const glucoseCard = cards.nth(2);
    await expect(glucoseCard).toContainText('90');
    await expect(glucoseCard).toContainText('Normal');
  });

  test('summary table shows three Healthy badges', async ({ page }) => {
    const badges = page.locator('.status-badge');
    for (const badge of await badges.all()) {
      await expect(badge).toContainText('Healthy');
    }
  });

  test('recommendation advises continuing healthy lifestyle', async ({ page }) => {
    await expect(page.locator('.recommendation')).toContainText(
      'All vitals are within normal ranges'
    );
  });
});

// ── At Risk scenario ──────────────────────────────────────────────────────

test.describe('At Risk classification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Overweight BMI, elevated BP, prediabetes glucose
    await fillForm(page, { bmi: '27', systolic: '125', diastolic: '78', glucose: '110' });
    await analyse(page);
  });

  test('overall banner shows At Risk status', async ({ page }) => {
    await expect(page.locator('.overall-status')).toContainText('At Risk');
  });

  test('BMI metric card shows Overweight', async ({ page }) => {
    await expect(page.locator('.metric-card').nth(0)).toContainText('Overweight');
  });

  test('Blood Pressure metric card shows Elevated', async ({ page }) => {
    await expect(page.locator('.metric-card').nth(1)).toContainText('Elevated');
  });

  test('Glucose metric card shows Prediabetes', async ({ page }) => {
    await expect(page.locator('.metric-card').nth(2)).toContainText('Prediabetes');
  });

  test('recommendation advises consulting a physician', async ({ page }) => {
    await expect(page.locator('.recommendation')).toContainText(
      'Lifestyle changes are advised'
    );
  });
});

// ── Critical scenario ─────────────────────────────────────────────────────

test.describe('Critical classification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Obese BMI, hypertensive crisis BP, diabetes glucose
    await fillForm(page, { bmi: '35', systolic: '185', diastolic: '125', glucose: '140' });
    await analyse(page);
  });

  test('overall banner shows Critical status', async ({ page }) => {
    await expect(page.locator('.overall-status')).toContainText('Critical');
  });

  test('BMI metric card shows Obese', async ({ page }) => {
    await expect(page.locator('.metric-card').nth(0)).toContainText('Obese');
  });

  test('Blood Pressure metric card shows Hypertensive Crisis', async ({ page }) => {
    await expect(page.locator('.metric-card').nth(1)).toContainText('Hypertensive Crisis');
  });

  test('Glucose metric card shows Diabetes Range', async ({ page }) => {
    await expect(page.locator('.metric-card').nth(2)).toContainText('Diabetes Range');
  });

  test('recommendation urges immediate medical attention', async ({ page }) => {
    await expect(page.locator('.recommendation')).toContainText(
      'Immediate medical attention'
    );
  });
});

// ── Mixed severity (critical overrides risk) ──────────────────────────────

test.describe('Mixed severity — critical overrides risk', () => {
  test('overall status is Critical when only BP is critical, others healthy', async ({ page }) => {
    await page.goto('/');
    await fillForm(page, { bmi: '22', systolic: '145', diastolic: '95', glucose: '90' });
    await analyse(page);
    await expect(page.locator('.overall-status')).toContainText('Critical');
  });

  test('overall status is Risk when one metric is risk and none critical', async ({ page }) => {
    await page.goto('/');
    await fillForm(page, { bmi: '26', systolic: '115', diastolic: '75', glucose: '90' });
    await analyse(page);
    await expect(page.locator('.overall-status')).toContainText('At Risk');
  });
});

// ── Patient name ──────────────────────────────────────────────────────────

test.describe('Patient name', () => {
  test('displays patient name in the overall status banner', async ({ page }) => {
    await page.goto('/');
    await fillForm(page, {
      name: 'Jane Doe',
      bmi: '22',
      systolic: '115',
      diastolic: '75',
      glucose: '90',
    });
    await analyse(page);
    await expect(page.locator('.overall-status')).toContainText('Jane Doe');
  });

  test('banner shows status without name when name is omitted', async ({ page }) => {
    await page.goto('/');
    await fillForm(page, { bmi: '22', systolic: '115', diastolic: '75', glucose: '90' });
    await analyse(page);
    const banner = page.locator('.overall-status');
    await expect(banner).toContainText('Healthy');
    await expect(banner).not.toContainText('—');
  });
});

// ── Summary table ─────────────────────────────────────────────────────────

test.describe('Summary table', () => {
  test('table shows correct metric values after analysis', async ({ page }) => {
    await page.goto('/');
    await fillForm(page, { bmi: '22', systolic: '115', diastolic: '75', glucose: '90' });
    await analyse(page);
    const table = page.locator('.summary-table');
    await expect(table).toContainText('22 kg/m²');
    await expect(table).toContainText('115/75 mmHg');
    await expect(table).toContainText('90 mg/dL');
  });

  test('table headers are present', async ({ page }) => {
    await page.goto('/');
    await fillForm(page, { bmi: '22', systolic: '115', diastolic: '75', glucose: '90' });
    await analyse(page);
    const table = page.locator('.summary-table');
    await expect(table).toContainText('Metric');
    await expect(table).toContainText('Value');
    await expect(table).toContainText('Category');
    await expect(table).toContainText('Status');
  });
});

// ── Reset ─────────────────────────────────────────────────────────────────

test.describe('Reset button', () => {
  test('clears all input fields', async ({ page }) => {
    await page.goto('/');
    await fillForm(page, { bmi: '22', systolic: '115', diastolic: '75', glucose: '90' });
    await analyse(page);
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.getByPlaceholder('e.g. 22.5')).toBeEmpty();
    await expect(page.getByPlaceholder('Systolic')).toBeEmpty();
    await expect(page.getByPlaceholder('Diastolic')).toBeEmpty();
    await expect(page.getByPlaceholder('e.g. 95')).toBeEmpty();
  });

  test('restores the empty-state dashboard prompt', async ({ page }) => {
    await page.goto('/');
    await fillForm(page, { bmi: '22', systolic: '115', diastolic: '75', glucose: '90' });
    await analyse(page);
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.getByText('Enter patient vitals and click')).toBeVisible();
  });

  test('clears patient name field', async ({ page }) => {
    await page.goto('/');
    await fillForm(page, {
      name: 'John Smith',
      bmi: '22',
      systolic: '115',
      diastolic: '75',
      glucose: '90',
    });
    await analyse(page);
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.getByPlaceholder('e.g. John Smith')).toBeEmpty();
  });
});
