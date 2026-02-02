import { type FC, type SetStateAction } from 'react';
import { Tab } from '../hooks/usePatientForm';
import { Button } from '../../../shared/components/Button';
import { cn } from '../../../shared/utils/helpers';

type Props = {
	tabName: Tab;
	currentTab: Tab;
	error: boolean;
	setTab: (value: SetStateAction<Tab>) => void;
};

const TabButton: FC<Props> = ({ tabName, error, setTab, currentTab }) => (
	<Button
		onClick={() => setTab(tabName)}
		type='button'
		variant={error ? 'red' : 'default'}
		className={cn({ 'opacity-60': currentTab !== tabName })}
	>
		{tabName}
	</Button>
);

export default TabButton;
