import { createFileRoute, Navigate } from '@tanstack/react-router';

const Root = () => Navigate({ to: '/login' });

export const Route = createFileRoute('/')({
	component: Root
});
