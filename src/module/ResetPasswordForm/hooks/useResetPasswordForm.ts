import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ResetPasswordSchema, TResetPasswordSchema } from '../../../shared/form/schemas';
import { requiredFieldsAreEmpty } from '../../../shared/utils/helpers';

const useResetPasswordForm = () => {
	const {
		register,
		handleSubmit: handleValidation,
		formState: { errors },
		setFocus,
		watch,
	} = useForm<TResetPasswordSchema>({
		resolver: zodResolver(ResetPasswordSchema),
		reValidateMode: 'onSubmit',
	});

	const { mutate, isPending } = useMutation({
		mutationFn: async (user: TResetPasswordSchema) => {
			console.log(user);
			// TODO: Reset password function
		},
	});

	useEffect(() => {
		setFocus('password');
	}, [setFocus]);

	const buttonDisabled = requiredFieldsAreEmpty<TResetPasswordSchema>(watch, [
		'password',
		'confirmPassword',
	]);

	return {
		handleSubmit: handleValidation(user => mutate(user)),
		errors,
		register,
		isSubmitting: isPending,
		buttonDisabled,
	};
};

export default useResetPasswordForm;
