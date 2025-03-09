# 🔔 use-toastr

[![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/-Vitest-729B1B?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Features

- 🤯 **Beautiful by default**: Clean design with smooth animations
- 🔍 **Accessible**: Follows WAI-ARIA guidelines for screen readers
- 📱 **Responsive**: Adapts to any screen size, including mobile devices
- 🌗 **Theming**: Light and dark modes included out of the box
- 🌈 **Rich colors**: Enhanced visual feedback for different toast types
- ⌨️ **Keyboard friendly**: Navigate through toasts with hotkeys
- 🧩 **Customizable**: Extensive styling options for perfect integration
- 💨 **Lightweight**: Small bundle size with zero dependencies

## Installation

```bash
npm install use-toastr
# or
yarn add use-toastr
# or
pnpm add use-toastr
```

## Quick Start

```jsx
import { Toastr, toast } from 'use-toastr';

function MyApp() {
	return (
		<div>
			<Toastr />
			<button onClick={() => toast('My first toast')}>Show Toast</button>
		</div>
	);
}
```

## Toast Types

```jsx
// Default
toast('Event has been created');

// Success
toast.success('Event has been created');

// Error
toast.error('Event could not be created');

// Info
toast.info('Be at the venue 10 minutes before the event');

// Warning
toast.warning('Event capacity almost reached');

// Custom JSX
toast(
	<div className='custom-toast-content'>
		<span className='emoji'>🎉</span>
		<div>
			<strong>Customized!</strong>
			<p>This is a toast with custom content</p>
		</div>
	</div>
);
```

## Advanced Usage

### With Actions

```jsx
toast('New message received', {
	action: {
		label: 'View',
		onClick: () => console.log('Viewing message...')
	},
	cancel: {
		label: 'Dismiss',
		onClick: () => console.log('Dismissing notification...')
	}
});
```

### Loading State + Promise

```jsx
toast.promise(
	// Your promise
	fetch('/api/data').then(res => res.json()),
	{
		loading: 'Loading data...',
		success: data => 'Successfully loaded data!',
		error: err => `Error: ${err.message}`
	}
);
```

### Persistent Toast

```jsx
toast('This toast will not disappear automatically', {
	duration: Infinity,
	closeButton: true,
	id: 'persistent-toast'
});

// To dismiss it programmatically later:
toast.dismiss('persistent-toast');
```

## Component API

### Toastr Component

```jsx
<Toastr
	// Changes the default position
	position='top-center'
	// Expands height of toasts when expanded
	expand={true}
	// Maximum number of visible toasts
	visibleToasts={3}
	// Default duration for toasts in milliseconds
	duration={4000}
	// Gap between toasts
	gap={14}
	// Apply rich colors to toast variants
	richColors={true}
	// Invert toast theme (useful for dark backgrounds)
	invert={false}
	// Theming: 'light', 'dark', or 'system'
	theme='light'
	// Hotkey to focus toasts (default: Option+T)
	hotkey={['altKey', 'KeyT']}
	// Custom styling
	className='my-custom-toastr'
	// Control offset from viewport edge
	offset='24px'
	// Different offset for mobile
	mobileOffset='16px'
	// Text direction
	dir='ltr'
	// Toast-specific options
	toastOptions={{
		className: '',
		duration: 4000
		// And more...
	}}
/>
```

### Toast Function

```jsx
toast(message, {
	// Toast type
	type: 'success',

	// Custom ID for programmatic dismissal
	id: 'custom-id',

	// Toast duration in milliseconds
	duration: 5000,

	// Show/hide close button
	closeButton: true,

	// Icon to display with the toast
	icon: <CustomIcon />,

	// Custom action button
	action: {
		label: 'Action',
		onClick: () => console.log('Action clicked')
	},

	// Cancel button
	cancel: {
		label: 'Cancel',
		onClick: () => console.log('Cancelled')
	},

	// Whether user can dismiss the toast
	dismissible: true,

	// Callback when toast is dismissed
	onDismiss: toast => console.log('Toast dismissed', toast),

	// Callback when toast auto-closes
	onAutoClose: toast => console.log('Toast auto-closed', toast),

	// Apply rich colors
	richColors: true,

	// Invert toast theme
	invert: false,

	// Custom positioning
	position: 'bottom-right',

	// Styling options
	className: 'my-toast',
	style: { background: '#fff' },
	descriptionClassName: 'toast-description',

	// Apply different class names per element
	classNames: {
		toast: 'custom-toast',
		title: 'custom-title',
		description: 'custom-description'
		// And more...
	}
});
```

## Useful Methods

```jsx
// Get all active toasts
const activeToasts = toast.getToasts();

// Get toast history (including dismissed)
const history = toast.getHistory();

// Dismiss a specific toast
toast.dismiss('toast-id');

// Dismiss all toasts
toast.dismiss();

// Create custom toast with JSX
toast.custom(id => <div>Custom toast with ID: {id}</div>);
```

## Accessibility

use-toastr is designed with accessibility in mind:

- Screen reader announcements for toast messages
- Keyboard navigation support
- WAI-ARIA compliant
- Focus management
- Appropriate color contrast

## Browser Support

use-toastr works in all modern browsers (Chrome, Firefox, Safari, and Edge).

## License

MIT © [Felipe Rohde](mailto:feliperohdee@gmail.com)

## Contributing

Contributions, issues, and feature requests are welcome!

## Author

**Felipe Rohde**

- Twitter: [@felipe_rohde](https://twitter.com/felipe_rohde)
- Github: [@feliperohdee](https://github.com/feliperohdee)
- Email: feliperohdee@gmail.com

## Show your support

Give a ⭐️ if this project helped you!
