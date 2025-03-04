import '@/demo.css';

import { useState } from 'react';
import { toast, Toaster } from '@/sonner';
import { Position } from '@/sonner/types';

const SonnerDemo = () => {
	const [position, setPosition] = useState<Position>('bottom-right');
	const [duration, setDuration] = useState(4000);
	const [richColors, setRichColors] = useState(true);
	const [persistentToast, setPersistentToast] = useState<string>('');

	const createBasicToast = () => {
		toast('This is a basic notification');
	};

	const createSuccessToast = () => {
		toast.success('Operation completed successfully!');
	};

	const createErrorToast = () => {
		toast.error('An error occurred during the operation.');
	};

	const createInfoToast = () => {
		toast.info('Here is some important information.');
	};

	const createWarningToast = () => {
		toast.warning('Warning! This is an alert.');
	};

	const createLoadingToast = () => {
		const toastId = toast.loading('Loading data...');

		// Simulates an async operation
		setTimeout(() => {
			toast.success('Data loaded successfully!', {
				id: toastId
			});
		}, 3000);
	};

	const createPromiseToast = () => {
		toast.promise(
			// A simulated promise
			new Promise(resolve => setTimeout(resolve, 2000)),
			{
				loading: 'Sending data...',
				success: 'Data sent successfully!',
				error: 'Error sending data.'
			}
		);
	};

	const createCustomToast = () => {
		toast(
			<div className='custom-toast-content'>
				<span className='emoji'>🎉</span>
				<div>
					<strong>Customized!</strong>
					<p>This is a toast with custom content</p>
				</div>
			</div>
		);
	};

	const createActionToast = () => {
		toast('You have a new message', {
			action: {
				label: 'View',
				onClick: () => console.log('Viewing message...')
			},
			cancel: {
				label: 'Dismiss',
				onClick: () => console.log('Dismissing notification...')
			}
		});
	};

	const createPersistentToast = () => {
		toast('This notification does not disappear automatically', {
			duration: Infinity,
			closeButton: true,
			id: 'persistent-toast'
		});
	};

	const closePersistentToast = () => {
		toast.dismiss('persistent-toast');
	};

	return (
		<div className='sonner-demo dark-slate'>
			<div className='container'>
				<div className='header'>
					<h1>Sonner Library</h1>
					<p>
						A beautiful, accessible, and customizable toast
						notification component for React
					</p>
				</div>

				<div className='config-panel'>
					<h2>Configuration</h2>
					<div className='config-options'>
						<div className='config-option'>
							<label>Position:</label>
							<select
								value={position}
								onChange={e =>
									setPosition(e.target.value as Position)
								}
							>
								<option value='top-left'>Top Left</option>
								<option value='top-center'>Top Center</option>
								<option value='top-right'>Top Right</option>
								<option value='bottom-left'>Bottom Left</option>
								<option value='bottom-center'>
									Bottom Center
								</option>
								<option value='bottom-right'>
									Bottom Right
								</option>
							</select>
						</div>
						<div className='config-option'>
							<label>Duration (ms):</label>
							<input
								type='number'
								value={duration}
								onChange={e =>
									setDuration(Number(e.target.value))
								}
								min='1000'
								step='500'
							/>
						</div>
						<div className='config-option'>
							<label>Rich Colors:</label>
							<input
								type='checkbox'
								checked={richColors}
								onChange={e => setRichColors(e.target.checked)}
							/>
						</div>
					</div>
				</div>

				<div className='toast-buttons'>
					<h2>Notification Types</h2>
					<div className='buttons-grid'>
						<button
							className='toast-btn default'
							onClick={createBasicToast}
						>
							<span className='icon'>📢</span>
							<span>Basic</span>
						</button>
						<button
							className='toast-btn success'
							onClick={createSuccessToast}
						>
							<span className='icon'>✅</span>
							<span>Success</span>
						</button>
						<button
							className='toast-btn error'
							onClick={createErrorToast}
						>
							<span className='icon'>❌</span>
							<span>Error</span>
						</button>
						<button
							className='toast-btn info'
							onClick={createInfoToast}
						>
							<span className='icon'>ℹ️</span>
							<span>Information</span>
						</button>
						<button
							className='toast-btn warning'
							onClick={createWarningToast}
						>
							<span className='icon'>⚠️</span>
							<span>Warning</span>
						</button>
						<button
							className='toast-btn loading'
							onClick={createLoadingToast}
						>
							<span className='icon'>⏳</span>
							<span>Loading</span>
						</button>
						<button
							className='toast-btn promise'
							onClick={createPromiseToast}
						>
							<span className='icon'>🔄</span>
							<span>Promise</span>
						</button>
						<button
							className='toast-btn custom'
							onClick={createCustomToast}
						>
							<span className='icon'>🎨</span>
							<span>Custom</span>
						</button>
						<button
							className='toast-btn action'
							onClick={createActionToast}
						>
							<span className='icon'>👆</span>
							<span>With Actions</span>
						</button>
						<button
							className='toast-btn persistent'
							onClick={() => {
								if (persistentToast) {
									closePersistentToast();
									setPersistentToast('');
								} else {
									createPersistentToast();
									setPersistentToast('persistent-toast');
								}
							}}
						>
							<span className='icon'>
								{persistentToast ? '❌' : '📌'}
							</span>
							<span>
								{persistentToast ? 'Close' : 'Persistent'}
							</span>
						</button>
					</div>
				</div>

				<div className='code-example'>
					<h2>Code Example</h2>
					<div className='code-block'>
						<pre>
							<code>
								{`// Basic import
import { toast, Toaster } from 'use-sonner';

// Add the Toaster component to your app
const App = () => {
  return (
    <>
      <Toaster position="${position}" theme="dark" />
      {/* Rest of your app */}
    </>
  )
};

// Create a basic notification
toast('Basic notification');

// Create a success notification
toast.success('Success!');

// Create an error notification
toast.error('Error!');

// Create a notification with actions
toast('New message', {
  action: {
    label: 'View',
    onClick: () => console.log('Viewing...')
  }
});`}
							</code>
						</pre>
					</div>
				</div>
			</div>

			{/* Toaster component with chosen settings */}
			<Toaster
				position={position}
				theme='dark'
				duration={duration}
				richColors={richColors}
				closeButton
			/>

			<footer>
				<p>Made with ❤️ | Sonner Library for React</p>
			</footer>
		</div>
	);
};

export default SonnerDemo;
