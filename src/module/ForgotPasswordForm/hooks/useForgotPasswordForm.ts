import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ForgotPasswordSchema, TForgotPasswordSchema } from '../../../shared/form/schemas';

const useForgotPasswordForm = () => {
	const {
		register,
		handleSubmit: handleValidation,
		formState: { errors, isValid },
		setFocus,
	} = useForm<TForgotPasswordSchema>({
		resolver: zodResolver(ForgotPasswordSchema),
		reValidateMode: 'onSubmit',
	});

	const { mutate, isPending } = useMutation({
		mutationFn: async (user: TForgotPasswordSchema) => {
			console.log(user);
			// TODO: Forgot password function
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

export default useForgotPasswordForm;
