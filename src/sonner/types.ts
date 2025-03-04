export type ToastTypes =
	| 'normal'
	| 'action'
	| 'success'
	| 'info'
	| 'warning'
	| 'error'
	| 'loading'
	| 'default';

export type PromiseT<Data = any> = Promise<Data> | (() => Promise<Data>);

export interface PromiseIExtendedResult extends ExternalToast {
	message: React.ReactNode;
}

export type PromiseTExtendedResult<Data = any> =
	| PromiseIExtendedResult
	| ((
			data: Data
	  ) => PromiseIExtendedResult | Promise<PromiseIExtendedResult>);

export type PromiseTResult<Data = any> =
	| string
	| React.ReactNode
	| ((
			data: Data
	  ) => React.ReactNode | string | Promise<React.ReactNode | string>);

export type PromiseExternalToast = Omit<ExternalToast, 'description'>;

export type PromiseData<ToastData = any> = PromiseExternalToast & {
	description?: PromiseTResult;
	error?: PromiseTResult | PromiseTExtendedResult;
	finally?: () => void | Promise<void>;
	loading?: string | React.ReactNode;
	success?: PromiseTResult<ToastData> | PromiseTExtendedResult<ToastData>;
};

export interface ToastClassnames {
	actionButton?: string;
	cancelButton?: string;
	closeButton?: string;
	content?: string;
	default?: string;
	description?: string;
	error?: string;
	icon?: string;
	info?: string;
	loader?: string;
	loading?: string;
	success?: string;
	title?: string;
	toast?: string;
	warning?: string;
}

export interface ToastIcons {
	success?: React.ReactNode;
	info?: React.ReactNode;
	warning?: React.ReactNode;
	error?: React.ReactNode;
	loading?: React.ReactNode;
	close?: React.ReactNode;
}

export interface Action {
	label: React.ReactNode;
	onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
	actionButtonStyle?: React.CSSProperties;
}

export interface ToastT {
	action?: Action | React.ReactNode;
	actionButtonStyle?: React.CSSProperties;
	cancel?: Action | React.ReactNode;
	cancelButtonStyle?: React.CSSProperties;
	className?: string;
	classNames?: ToastClassnames;
	closeButton?: boolean;
	delete?: boolean;
	description?: (() => React.ReactNode) | React.ReactNode;
	descriptionClassName?: string;
	dismissible?: boolean;
	duration?: number;
	icon?: React.ReactNode;
	id: number | string;
	invert?: boolean;
	jsx?: React.ReactNode;
	onAutoClose?: (toast: ToastT) => void;
	onDismiss?: (toast: ToastT) => void;
	position?: Position;
	promise?: PromiseT;
	richColors?: boolean;
	style?: React.CSSProperties;
	title?: (() => React.ReactNode) | React.ReactNode;
	type?: ToastTypes;
	unstyled?: boolean;
}

export function isAction(action: Action | React.ReactNode): action is Action {
	return (action as Action).label !== undefined;
}

export type Position =
	| 'top-left'
	| 'top-right'
	| 'bottom-left'
	| 'bottom-right'
	| 'top-center'
	| 'bottom-center';
export interface HeightT {
	height: number;
	toastId: number | string;
	position: Position;
}

interface ToastOptions {
	actionButtonStyle?: React.CSSProperties;
	cancelButtonStyle?: React.CSSProperties;
	className?: string;
	classNames?: ToastClassnames;
	closeButton?: boolean;
	closeButtonAriaLabel?: string;
	descriptionClassName?: string;
	duration?: number;
	style?: React.CSSProperties;
	unstyled?: boolean;
}

type Offset =
	| {
			top?: string | number;
			right?: string | number;
			bottom?: string | number;
			left?: string | number;
	  }
	| string
	| number;

export interface ToasterProps {
	className?: string;
	closeButton?: boolean;
	containerAriaLabel?: string;
	dir?: 'rtl' | 'ltr' | 'auto';
	duration?: number;
	expand?: boolean;
	gap?: number;
	hotkey?: string[];
	icons?: ToastIcons;
	invert?: boolean;
	mobileOffset?: Offset;
	offset?: Offset;
	position?: Position;
	richColors?: boolean;
	style?: React.CSSProperties;
	swipeDirections?: SwipeDirection[];
	theme?: 'light' | 'dark' | 'system';
	toastOptions?: ToastOptions;
	visibleToasts?: number;
}

export type SwipeDirection = 'top' | 'right' | 'bottom' | 'left';

export interface ToastProps {
	actionButtonStyle?: React.CSSProperties;
	cancelButtonStyle?: React.CSSProperties;
	className?: string;
	classNames?: ToastClassnames;
	closeButton: boolean;
	closeButtonAriaLabel?: string;
	defaultRichColors?: boolean;
	descriptionClassName?: string;
	duration?: number;
	expandByDefault: boolean;
	expanded: boolean;
	gap?: number;
	heights: HeightT[];
	icons?: ToastIcons;
	index: number;
	interacting: boolean;
	invert: boolean;
	loadingIcon?: React.ReactNode;
	position: Position;
	removeToast: (toast: ToastT) => void;
	setHeights: React.Dispatch<React.SetStateAction<HeightT[]>>;
	style?: React.CSSProperties;
	swipeDirections?: SwipeDirection[];
	toast: ToastT;
	toasts: ToastT[];
	unstyled?: boolean;
	visibleToasts: number;
}

export enum SwipeStateTypes {
	SwipedOut = 'SwipedOut',
	SwipedBack = 'SwipedBack',
	NotSwiped = 'NotSwiped'
}

export type Theme = 'light' | 'dark';

export interface ToastToDismiss {
	id: number | string;
	dismiss: boolean;
}

export type ExternalToast = Omit<
	ToastT,
	'id' | 'type' | 'title' | 'jsx' | 'delete' | 'promise'
> & {
	id?: number | string;
};
