import { createFileRoute } from '@tanstack/react-router';

const Messages = () => {
	return <div className='mx-auto w-fit text-2xl font-bold'>Coming soon!</div>;
};

export const Route = createFileRoute('/_protected/messages')({
	component: Messages,
	loader: ({ context }) => {
		context.pageName = 'Messages';
	},
});
