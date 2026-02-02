import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { LoginSchema, TLoginSchema } from '../../../shared/form/schemas';
import { useNavigate } from '@tanstack/react-router';

const useLoginForm = () => {
	const {
		register,
		handleSubmit: handleValidation,
		formState: { errors, isValid },
		setFocus,
	} = useForm<TLoginSchema>({
		resolver: zodResolver(LoginSchema),
		reValidateMode: 'onSubmit',
	});
	const navigate = useNavigate();

	const { mutate, isPending } = useMutation({
		mutationFn: async (user: TLoginSchema) => {
			console.log(user);
			navigate({ to: '/patients' });
			// TODO: Login function
		},
	});

	useEffect(() => {
		setFocus('email');
	}, [setFocus]);

	return {
		handleSubmit: handleValidation(user => mutate(user)),
		errors,
		register,
		isSubmitting: isPending,
		buttonDisabled: !isValid,
	};
};

export default useLoginForm;
