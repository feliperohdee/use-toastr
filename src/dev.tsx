import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { toast, Toaster } from '@/sonner';

let index = 0;
const PHRASES = [
	'Hello',
	'World',
	'This is a test',
	'Make sure to check out the repo',
	'https://github.com/feliperohdee/use-sonner',
	'Give it a star if you like it',
	'Thanks for checking it out',
	'Have a great day',
	'Goodbye'
];

setInterval(() => {
	toast.success(PHRASES[index++ % PHRASES.length]);
}, 1000);

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Toaster
			richColors
			theme='dark'
		/>
	</StrictMode>
);
