import { userMetadataUpdateConfig } from '../../../api/apiConfig';
import type { User } from '../../../types/UserTypes';
import { axiosClient } from '../../../utils/axiosClient';

// TODO: Remove placeholders
export const getUser = (): User => {
	return {
		firstName: 'John',
		lastName: 'Doe',
		jobRole: 'Endocrinologist',
		email: 'john@mig.com',
		medicalId: 'alpha567',
	};
};

export const updateUser = async (token: string, user: Partial<User>): Promise<void> => {
		//console.log('user val', user);
		const userMetadata = {
			jobRole: user.jobRole
		};
		const userMetadataUpdateWithBody = {
		  ...userMetadataUpdateConfig(token),
		  body: userMetadata,
		};
		const result = await axiosClient(userMetadataUpdateWithBody);
		//console.log("appMetadataUpdateResponse: ", result);
	console.log("user job role updated", result);
};
