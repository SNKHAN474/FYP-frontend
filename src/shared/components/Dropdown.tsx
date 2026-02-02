import { Fragment, useId } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { cn } from '../utils/helpers';
import { ChevronDown } from 'lucide-react';

type Props = {
	label?: string;
	placeholderLabel: string;
	value?: string | null;
	updateValue: (value: string) => void;
	options: { label: string; value: string }[];
	error?: string;
	hideErrors?: boolean;
	direction?: 'up' | 'down';
};

const Dropdown = (props: Props) => {
	const {
		placeholderLabel,
		error,
		value,
		updateValue,
		options,
		direction = 'down',
		label,
		hideErrors = false,
	} = props;
	const selectedOptionLabel = options.find(option => option.value === value)?.label;
	const dropdownLabel = selectedOptionLabel || placeholderLabel;
	const randomKey = useId();

	return (
		<div className='w-full space-y-0.5'>
			{label && (
				<label className='text-sm' htmlFor={randomKey}>
					{label}
				</label>
			)}
			<Listbox as='div' className='relative' onChange={updateValue} value={value || ''}>
				<Listbox.Button
					className={cn(
						'flex h-10 w-full items-center justify-between rounded-xl border px-3 py-2 text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
						{
							'border-red-primary': error,
							'focus-visible:border-ring border-slate-border focus:border-slate-secondary': !error,
							'text-slate-secondary': !value,
						},
					)}
					id={randomKey}
				>
					{dropdownLabel}
					{direction === 'up' ? <ChevronDown className='rotate-180' /> : <ChevronDown />}
				</Listbox.Button>
				<Transition
					as={Fragment}
					enter='transition duration-100 ease-out'
					enterFrom='transform scale-95 opacity-0'
					enterTo='transform scale-100 opacity-100'
					leave='transition duration-75 ease-out'
					leaveFrom='transform scale-100 opacity-100'
					leaveTo='transform scale-95 opacity-0'
				>
					<Listbox.Options
						className={cn(
							'absolute z-10 flex max-h-28 w-full flex-col gap-y-2 overflow-y-auto rounded-xl bg-white-primary',
							{
								'bottom-12': direction === 'up',
								'top-12': direction === 'down',
							},
						)}
					>
						{options.map(({ label, value }) => (
							<Listbox.Option
								key={`dropdown-option-${value}`}
								value={value}
								className='w-full cursor-pointer rounded-xl px-3 py-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ui-selected:bg-blue-primary ui-selected:text-white-primary ui-not-selected:bg-white-primary ui-not-selected:hover:bg-blue-primary ui-not-selected:hover:text-white-primary'
							>
								{label}
							</Listbox.Option>
						))}
					</Listbox.Options>
				</Transition>
			</Listbox>
			{!hideErrors &&
				(error ? <p className='h-5 text-sm text-red-primary'>{error}</p> : <div className='h-5' />)}
		</div>
	);
};

export default Dropdown;
