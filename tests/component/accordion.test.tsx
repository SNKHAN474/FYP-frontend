import React from 'react';
import { test, expect, MountResult } from '@playwright/experimental-ct-react';
import Accordion from '../../src/shared/components/Accordion';

test.use({ viewport: { width: 1920, height: 1080 } });

const title = 'Accordion Title';
let component: MountResult;

test.beforeEach(async ({ mount }) => {
	component = await mount(
		<div className='w-1/4'>
			<Accordion title={title} animationDuration={0.2}>
				<div>Accordion Content</div>
			</Accordion>
		</div>,
	);
});

test('Should match snapshot', async () => {
	await expect(component).toHaveScreenshot('open.png');
});

test('Should be collapsible', async () => {
	await component.getByRole('heading', { name: title }).click();
	await expect(component).toHaveScreenshot('closed.png');
});
