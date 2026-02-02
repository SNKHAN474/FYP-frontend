
//@ts-nocheck
import { type FC } from 'react';
import Modal from '../../../shared/components/Modal';
import { type QueryParams } from '../../../routes/_protected/patients';
import PatientForm from './PatientForm';
import { EditingPatient } from '../../../types/PatientTypes';

type Props = {
	patient?: EditingPatient;
	mode: QueryParams['mode'];
	token: string | undefined;
	handleShowModal: () => void;
};

const PatientModal: FC<Props> = props => (
	<Modal
		panelClassName='max-w-md'
		showModal={!!props.mode}
		handleShowModal={props.handleShowModal}
		disableTransition
	>
		<PatientForm key={`patients-${props.patient?.id || 'add'}`} {...props} />
	</Modal>
);

export default PatientModal;
