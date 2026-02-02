import { LinkOptions, useRouterState } from '@tanstack/react-router';
import { RouterContext } from '../../../routes/__root';

interface Context extends RouterContext {
	returnLink: LinkOptions['to'] | '';
}

const usePageInfo = (): Context => {
	const matches = useRouterState({ select: state => state.matches });
	return matches[matches.length - 1].context as Context;
};

export default usePageInfo;
