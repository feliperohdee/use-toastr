import '@/toastr/styles.css';

import { flushSync } from 'react-dom';
import {
	forwardRef,
	isValidElement,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState
} from 'react';

import { CloseIcon, getAsset, Loader } from '@/toastr/assets';
import { useIsDocumentHidden } from '@/toastr/hooks';
import { toast, ToastState } from '@/toastr/state';
import {
	HeightT,
	isAction,
	SwipeDirection,
	ToastrProps,
	ToastProps,
	ToastT,
	ToastToDismiss
} from '@/toastr/types';

// Visible toasts amount
const VISIBLE_TOASTS_AMOUNT = 3;

// Viewport padding
const VIEWPORT_OFFSET = '24px';

// Mobile viewport padding
const MOBILE_VIEWPORT_OFFSET = '16px';

// Default lifetime of a toasts (in ms)
const TOAST_LIFETIME = 4000;

// Default toast width
const TOAST_WIDTH = 356;

// Default gap between toasts
const GAP = 14;

// Threshold to dismiss a toast
const SWIPE_THRESHOLD = 45;

// Equal to exit animation duration
const TIME_BEFORE_UNMOUNT = 200;

const cn = (...classes: (string | undefined)[]) => {
	return classes.filter(Boolean).join(' ');
};

const getDefaultSwipeDirections = (position: string): Array<SwipeDirection> => {
	const [y, x] = position.split('-');
	const directions: Array<SwipeDirection> = [];

	if (y) {
		directions.push(y as SwipeDirection);
	}

	if (x) {
		directions.push(x as SwipeDirection);
	}

	return directions;
};

const Toast = (props: ToastProps) => {
	const {
		actionButtonStyle,
		cancelButtonStyle,
		className = '',
		classNames,
		closeButton: closeButtonFromToastr,
		closeButtonAriaLabel = 'Close toast',
		defaultRichColors,
		descriptionClassName = '',
		duration: durationFromToastr,
		expandByDefault,
		expanded,
		gap,
		heights,
		icons,
		index,
		interacting,
		invert: ToastrInvert,
		position,
		removeToast,
		setHeights,
		style,
		toast,
		toasts,
		unstyled,
		visibleToasts
	} = props;

	const [swipeDirection, setSwipeDirection] = useState<'x' | 'y' | null>(
		null
	);
	const [swipeOutDirection, setSwipeOutDirection] = useState<
		'left' | 'right' | 'up' | 'down' | null
	>(null);
	const [mounted, setMounted] = useState(false);
	const [removed, setRemoved] = useState(false);
	const [swiping, setSwiping] = useState(false);
	const [swipeOut, setSwipeOut] = useState(false);
	const [isSwiped, setIsSwiped] = useState(false);
	const [offsetBeforeRemove, setOffsetBeforeRemove] = useState(0);
	const [initialHeight, setInitialHeight] = useState(0);
	const remainingTime = useRef(
		toast.duration || durationFromToastr || TOAST_LIFETIME
	);
	const dragStartTime = useRef<Date | null>(null);
	const toastRef = useRef<HTMLLIElement>(null);
	const isFront = index === 0;
	const isVisible = index + 1 <= visibleToasts;
	const toastType = toast.type;
	const dismissible = toast.dismissible !== false;
	const toastClassname = toast.className || '';
	const toastDescriptionClassname = toast.descriptionClassName || '';
	// Height index is used to calculate the offset as it gets updated before the toast array, which means we can calculate the new layout faster.
	const heightIndex = useMemo(
		() => heights.findIndex(height => height.toastId === toast.id) || 0,
		[heights, toast.id]
	);
	const closeButton = useMemo(
		() => toast.closeButton ?? closeButtonFromToastr,
		[toast.closeButton, closeButtonFromToastr]
	);
	const duration = useMemo(
		() => toast.duration || durationFromToastr || TOAST_LIFETIME,
		[toast.duration, durationFromToastr]
	);
	const closeTimerStartTimeRef = useRef(0);
	const offset = useRef(0);
	const lastCloseTimerStartTimeRef = useRef(0);
	const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
	const [y, x] = position.split('-');
	const toastsHeightBefore = useMemo(() => {
		return heights.reduce((prev, curr, reducerIndex) => {
			// Calculate offset up until current toast
			if (reducerIndex >= heightIndex) {
				return prev;
			}

			return prev + curr.height;
		}, 0);
	}, [heights, heightIndex]);
	const isDocumentHidden = useIsDocumentHidden();

	const invert = toast.invert || ToastrInvert;
	const disabled = toastType === 'loading';

	offset.current = useMemo(() => {
		return heightIndex * (gap || GAP) + toastsHeightBefore;
	}, [gap, heightIndex, toastsHeightBefore]);

	useEffect(() => {
		remainingTime.current = duration;
	}, [duration]);

	useEffect(() => {
		// Trigger enter animation without using CSS animation
		setMounted(true);
	}, []);

	useEffect(() => {
		const toastNode = toastRef.current;
		if (toastNode) {
			const height = toastNode.getBoundingClientRect().height;
			// Add toast height to heights array after the toast is mounted
			setInitialHeight(height);
			setHeights(h => [
				{ toastId: toast.id, height, position: toast.position! },
				...h
			]);
			return () =>
				setHeights(h =>
					h.filter(height => height.toastId !== toast.id)
				);
		}
	}, [setHeights, toast]);

	useLayoutEffect(() => {
		if (!mounted) {
			return;
		}
		const toastNode = toastRef.current!;
		const originalHeight = toastNode.style.height;
		toastNode.style.height = 'auto';
		const newHeight = toastNode.getBoundingClientRect().height;
		toastNode.style.height = originalHeight;

		setInitialHeight(newHeight);

		setHeights(heights => {
			const alreadyExists = heights.find(
				height => height.toastId === toast.id
			);

			if (!alreadyExists) {
				return [
					{
						toastId: toast.id,
						height: newHeight,
						position: toast.position!
					},
					...heights
				];
			} else {
				return heights.map(height =>
					height.toastId === toast.id
						? { ...height, height: newHeight }
						: height
				);
			}
		});
	}, [mounted, toast.title, toast.description, setHeights, toast]);

	const deleteToast = useCallback(() => {
		// Save the offset for the exit swipe animation
		setRemoved(true);
		setOffsetBeforeRemove(offset.current);
		setHeights(h => h.filter(height => height.toastId !== toast.id));

		setTimeout(() => {
			removeToast(toast);
		}, TIME_BEFORE_UNMOUNT);
	}, [toast, removeToast, setHeights, offset]);

	useEffect(() => {
		if (
			(toast.promise && toastType === 'loading') ||
			toast.duration === Infinity ||
			toast.type === 'loading'
		)
			return;
		let timeoutId: NodeJS.Timeout;

		// Pause the timer on each hover
		const pauseTimer = () => {
			if (
				lastCloseTimerStartTimeRef.current <
				closeTimerStartTimeRef.current
			) {
				// Get the elapsed time since the timer started
				const elapsedTime =
					new Date().getTime() - closeTimerStartTimeRef.current;

				remainingTime.current = remainingTime.current - elapsedTime;
			}

			lastCloseTimerStartTimeRef.current = new Date().getTime();
		};

		const startTimer = () => {
			// setTimeout(, Infinity) behaves as if the delay is 0.
			// As a result, the toast would be closed immediately, giving the appearance that it was never rendered.
			// See: https://github.com/denysdovhan/wtfjs?tab=readme-ov-file#an-infinite-timeout
			if (remainingTime.current === Infinity) {
				return;
			}

			closeTimerStartTimeRef.current = new Date().getTime();

			// Let the toast know it has started
			timeoutId = setTimeout(() => {
				toast.onAutoClose?.(toast);
				deleteToast();
			}, remainingTime.current);
		};

		if (expanded || interacting || isDocumentHidden) {
			pauseTimer();
		} else {
			startTimer();
		}

		return () => clearTimeout(timeoutId);
	}, [
		expanded,
		interacting,
		toast,
		toastType,
		isDocumentHidden,
		deleteToast
	]);

	useEffect(() => {
		if (toast.delete) {
			deleteToast();
		}
	}, [deleteToast, toast.delete]);

	const getLoadingIcon = () => {
		if (icons?.loading) {
			return (
				<div
					className={cn(
						classNames?.loader,
						toast?.classNames?.loader,
						'toastr-loader'
					)}
					data-visible={toastType === 'loading'}
				>
					{icons.loading}
				</div>
			);
		}

		return (
			<Loader
				className={cn(classNames?.loader, toast?.classNames?.loader)}
				visible={toastType === 'loading'}
			/>
		);
	};

	return (
		<li
			tabIndex={0}
			ref={toastRef}
			className={cn(
				className,
				toastClassname,
				classNames?.toast,
				toast?.classNames?.toast,
				classNames?.default,
				// @ts-expect-error
				classNames?.[toastType],
				// @ts-expect-error
				toast?.classNames?.[toastType]
			)}
			data-toastr-toast=''
			data-rich-colors={toast.richColors ?? defaultRichColors}
			data-styled={!(toast.jsx || toast.unstyled || unstyled)}
			data-mounted={mounted}
			data-promise={Boolean(toast.promise)}
			data-swiped={isSwiped}
			data-removed={removed}
			data-visible={isVisible}
			data-y-position={y}
			data-x-position={x}
			data-index={index}
			data-front={isFront}
			data-swiping={swiping}
			data-dismissible={dismissible}
			data-type={toastType}
			data-invert={invert}
			data-swipe-out={swipeOut}
			data-swipe-direction={swipeOutDirection}
			data-expanded={Boolean(expanded || (expandByDefault && mounted))}
			style={{
				// @ts-expect-error
				'--index': index,
				'--toasts-before': index,
				'--z-index': toasts.length - index,
				'--offset': `${removed ? offsetBeforeRemove : offset.current}px`,
				'--initial-height': expandByDefault
					? 'auto'
					: `${initialHeight}px`,
				...style,
				...toast.style
			}}
			onDragEnd={() => {
				setSwiping(false);
				setSwipeDirection(null);
				pointerStartRef.current = null;
			}}
			onPointerDown={event => {
				if (disabled || !dismissible) {
					return;
				}
				dragStartTime.current = new Date();
				setOffsetBeforeRemove(offset.current);
				// Ensure we maintain correct pointer capture even when going outside of the toast (e.g. when swiping)
				(event.target as HTMLElement).setPointerCapture(
					event.pointerId
				);
				if ((event.target as HTMLElement).tagName === 'BUTTON') {
					return;
				}
				setSwiping(true);
				pointerStartRef.current = {
					x: event.clientX,
					y: event.clientY
				};
			}}
			onPointerUp={() => {
				if (swipeOut || !dismissible) {
					return;
				}

				pointerStartRef.current = null;
				const swipeAmountX = Number(
					toastRef.current?.style
						.getPropertyValue('--swipe-amount-x')
						.replace('px', '') || 0
				);
				const swipeAmountY = Number(
					toastRef.current?.style
						.getPropertyValue('--swipe-amount-y')
						.replace('px', '') || 0
				);
				const timeTaken =
					new Date().getTime() -
					(dragStartTime.current?.getTime() ?? 0);

				const swipeAmount =
					swipeDirection === 'x' ? swipeAmountX : swipeAmountY;
				const velocity = Math.abs(swipeAmount) / timeTaken;

				if (
					Math.abs(swipeAmount) >= SWIPE_THRESHOLD ||
					velocity > 0.11
				) {
					setOffsetBeforeRemove(offset.current);

					toast.onDismiss?.(toast);

					if (swipeDirection === 'x') {
						setSwipeOutDirection(
							swipeAmountX > 0 ? 'right' : 'left'
						);
					} else {
						setSwipeOutDirection(swipeAmountY > 0 ? 'down' : 'up');
					}

					deleteToast();
					setSwipeOut(true);

					return;
				} else {
					toastRef.current?.style.setProperty(
						'--swipe-amount-x',
						`0px`
					);
					toastRef.current?.style.setProperty(
						'--swipe-amount-y',
						`0px`
					);
				}
				setIsSwiped(false);
				setSwiping(false);
				setSwipeDirection(null);
			}}
			onPointerMove={event => {
				if (!pointerStartRef.current || !dismissible) {
					return;
				}

				const isHighlighted =
					window.getSelection()?.toString().length ?? 0 > 0;
				if (isHighlighted) {
					return;
				}

				const yDelta = event.clientY - pointerStartRef.current.y;
				const xDelta = event.clientX - pointerStartRef.current.x;

				const swipeDirections =
					props.swipeDirections ??
					getDefaultSwipeDirections(position);

				// Determine swipe direction if not already locked
				if (
					!swipeDirection &&
					(Math.abs(xDelta) > 1 || Math.abs(yDelta) > 1)
				) {
					setSwipeDirection(
						Math.abs(xDelta) > Math.abs(yDelta) ? 'x' : 'y'
					);
				}

				const swipeAmount = { x: 0, y: 0 };
				const getDampening = (delta: number) => {
					const factor = Math.abs(delta) / 20;

					return 1 / (1.5 + factor);
				};

				// Only apply swipe in the locked direction
				if (swipeDirection === 'y') {
					// Handle vertical swipes
					if (
						swipeDirections.includes('top') ||
						swipeDirections.includes('bottom')
					) {
						if (
							(swipeDirections.includes('top') && yDelta < 0) ||
							(swipeDirections.includes('bottom') && yDelta > 0)
						) {
							swipeAmount.y = yDelta;
						} else {
							// Smoothly transition to dampened movement
							const dampenedDelta = yDelta * getDampening(yDelta);
							// Ensure we don't jump when transitioning to dampened movement
							swipeAmount.y =
								Math.abs(dampenedDelta) < Math.abs(yDelta)
									? dampenedDelta
									: yDelta;
						}
					}
				} else if (swipeDirection === 'x') {
					// Handle horizontal swipes
					if (
						swipeDirections.includes('left') ||
						swipeDirections.includes('right')
					) {
						if (
							(swipeDirections.includes('left') && xDelta < 0) ||
							(swipeDirections.includes('right') && xDelta > 0)
						) {
							swipeAmount.x = xDelta;
						} else {
							// Smoothly transition to dampened movement
							const dampenedDelta = xDelta * getDampening(xDelta);
							// Ensure we don't jump when transitioning to dampened movement
							swipeAmount.x =
								Math.abs(dampenedDelta) < Math.abs(xDelta)
									? dampenedDelta
									: xDelta;
						}
					}
				}

				if (
					Math.abs(swipeAmount.x) > 0 ||
					Math.abs(swipeAmount.y) > 0
				) {
					setIsSwiped(true);
				}

				// Apply transform using both x and y values
				toastRef.current?.style.setProperty(
					'--swipe-amount-x',
					`${swipeAmount.x}px`
				);
				toastRef.current?.style.setProperty(
					'--swipe-amount-y',
					`${swipeAmount.y}px`
				);
			}}
		>
			{closeButton && !toast.jsx && toastType !== 'loading' ? (
				<button
					aria-label={closeButtonAriaLabel}
					data-disabled={disabled}
					data-close-button
					onClick={
						disabled || !dismissible
							? () => {}
							: () => {
									deleteToast();
									toast.onDismiss?.(toast);
								}
					}
					className={cn(
						classNames?.closeButton,
						toast?.classNames?.closeButton
					)}
				>
					{icons?.close ?? CloseIcon}
				</button>
			) : null}
			{/* TODO: This can be cleaner */}
			{toastType || toast.icon || toast.promise ? (
				<div
					data-icon=''
					className={cn(classNames?.icon, toast?.classNames?.icon)}
				>
					{toast.promise || (toast.type === 'loading' && !toast.icon)
						? toast.icon || getLoadingIcon()
						: null}
					{toast.type !== 'loading'
						? toast.icon ||
							// @ts-expect-error
							icons?.[toastType] ||
							getAsset(toastType!)
						: null}
				</div>
			) : null}

			<div
				data-content=''
				className={cn(classNames?.content, toast?.classNames?.content)}
			>
				<div
					data-title=''
					className={cn(classNames?.title, toast?.classNames?.title)}
				>
					{toast.jsx
						? toast.jsx
						: typeof toast.title === 'function'
							? toast.title()
							: toast.title}
				</div>
				{toast.description ? (
					<div
						data-description=''
						className={cn(
							descriptionClassName,
							toastDescriptionClassname,
							classNames?.description,
							toast?.classNames?.description
						)}
					>
						{typeof toast.description === 'function'
							? toast.description()
							: toast.description}
					</div>
				) : null}
			</div>

			{isValidElement(toast.cancel) ? (
				toast.cancel
			) : toast.cancel && isAction(toast.cancel) ? (
				<button
					data-button
					data-cancel
					style={toast.cancelButtonStyle || cancelButtonStyle}
					onClick={event => {
						// We need to check twice because typescript
						if (!isAction(toast.cancel)) {
							return;
						}
						if (!dismissible) {
							return;
						}
						toast.cancel.onClick?.(event);
						deleteToast();
					}}
					className={cn(
						classNames?.cancelButton,
						toast?.classNames?.cancelButton
					)}
				>
					{toast.cancel.label}
				</button>
			) : null}

			{isValidElement(toast.action) ? (
				toast.action
			) : toast.action && isAction(toast.action) ? (
				<button
					data-button
					data-action
					style={toast.actionButtonStyle || actionButtonStyle}
					onClick={event => {
						// We need to check twice because typescript
						if (!isAction(toast.action)) {
							return;
						}
						toast.action.onClick?.(event);
						if (event.defaultPrevented) {
							return;
						}
						deleteToast();
					}}
					className={cn(
						classNames?.actionButton,
						toast?.classNames?.actionButton
					)}
				>
					{toast.action.label}
				</button>
			) : null}
		</li>
	);
};

const getDocumentDirection = (): ToastrProps['dir'] => {
	if (typeof window === 'undefined') return 'ltr';
	if (typeof document === 'undefined') return 'ltr'; // For Fresh purpose

	const dirAttribute = document.documentElement.getAttribute('dir');

	if (dirAttribute === 'auto' || !dirAttribute) {
		return window.getComputedStyle(document.documentElement)
			.direction as ToastrProps['dir'];
	}

	return dirAttribute as ToastrProps['dir'];
};

const assignOffset = (
	defaultOffset: ToastrProps['offset'],
	mobileOffset: ToastrProps['mobileOffset']
) => {
	const styles = {};

	[defaultOffset, mobileOffset].forEach((offset, index) => {
		const isMobile = index === 1;
		const prefix = isMobile ? '--mobile-offset' : '--offset';
		const defaultValue = isMobile
			? MOBILE_VIEWPORT_OFFSET
			: VIEWPORT_OFFSET;

		function assignAll(offset: string | number) {
			['top', 'right', 'bottom', 'left'].forEach(key => {
				// @ts-expect-error
				styles[`${prefix}-${key}`] =
					typeof offset === 'number' ? `${offset}px` : offset;
			});
		}

		if (typeof offset === 'number' || typeof offset === 'string') {
			assignAll(offset);
		} else if (typeof offset === 'object') {
			['top', 'right', 'bottom', 'left'].forEach(key => {
				// @ts-expect-error
				if (offset[key] === undefined) {
					// @ts-expect-error
					styles[`${prefix}-${key}`] = defaultValue;
				} else {
					// @ts-expect-error
					styles[`${prefix}-${key}`] =
						// @ts-expect-error
						typeof offset[key] === 'number'
							? // @ts-expect-error
								`${offset[key]}px`
							: // @ts-expect-error
								offset[key];
				}
			});
		} else {
			assignAll(defaultValue);
		}
	});

	return styles;
};

const useToastr = () => {
	const [activeToasts, setActiveToasts] = useState<ToastT[]>([]);

	useEffect(() => {
		return ToastState.subscribe(toast => {
			if ((toast as ToastToDismiss).dismiss) {
				setTimeout(() => {
					flushSync(() => {
						setActiveToasts(toasts =>
							toasts.filter(t => t.id !== toast.id)
						);
					});
				});
				return;
			}

			// Prevent batching, temp solution.
			setTimeout(() => {
				flushSync(() => {
					setActiveToasts(toasts => {
						const indexOfExistingToast = toasts.findIndex(
							t => t.id === toast.id
						);

						// Update the toast if it already exists
						if (indexOfExistingToast !== -1) {
							return [
								...toasts.slice(0, indexOfExistingToast),
								{ ...toasts[indexOfExistingToast], ...toast },
								...toasts.slice(indexOfExistingToast + 1)
							];
						}

						return [toast, ...toasts];
					});
				});
			});
		});
	}, []);

	return {
		toasts: activeToasts
	};
};

const Toastr = forwardRef<HTMLElement, ToastrProps>((props, ref) => {
	const {
		className,
		closeButton,
		containerAriaLabel = 'Notifications',
		dir = getDocumentDirection(),
		duration,
		expand,
		gap = GAP,
		hotkey = ['altKey', 'KeyT'],
		icons,
		invert,
		mobileOffset,
		offset,
		position = 'bottom-right',
		richColors,
		style,
		theme = 'light',
		toastOptions,
		visibleToasts = VISIBLE_TOASTS_AMOUNT
	} = props;

	const [toasts, setToasts] = useState<ToastT[]>([]);
	const possiblePositions = useMemo(() => {
		return Array.from(
			new Set(
				[position].concat(
					toasts
						.filter(toast => toast.position!)
						.map(toast => toast.position!)
				)
			)
		);
	}, [toasts, position]);

	const [heights, setHeights] = useState<HeightT[]>([]);
	const [expanded, setExpanded] = useState(false);
	const [interacting, setInteracting] = useState(false);
	const [actualTheme, setActualTheme] = useState(
		theme !== 'system'
			? theme
			: typeof window !== 'undefined'
				? window.matchMedia &&
					window.matchMedia('(prefers-color-scheme: dark)').matches
					? 'dark'
					: 'light'
				: 'light'
	);

	const listRef = useRef<HTMLOListElement>(null);
	const hotkeyLabel = hotkey
		.join('+')
		.replace(/Key/g, '')
		.replace(/Digit/g, '');
	const lastFocusedElementRef = useRef<HTMLElement>(null);
	const isFocusWithinRef = useRef(false);

	const removeToast = useCallback((toastToRemove: ToastT) => {
		setToasts(toasts => {
			if (!toasts.find(toast => toast.id === toastToRemove.id)?.delete) {
				ToastState.dismiss(toastToRemove.id);
			}

			return toasts.filter(({ id }) => id !== toastToRemove.id);
		});
	}, []);

	useEffect(() => {
		return ToastState.subscribe(toast => {
			if ((toast as ToastToDismiss).dismiss) {
				setToasts(toasts =>
					toasts.map(t =>
						t.id === toast.id ? { ...t, delete: true } : t
					)
				);
				return;
			}

			// Prevent batching, temp solution.
			setTimeout(() => {
				flushSync(() => {
					setToasts(toasts => {
						const indexOfExistingToast = toasts.findIndex(
							t => t.id === toast.id
						);

						// Update the toast if it already exists
						if (indexOfExistingToast !== -1) {
							return [
								...toasts.slice(0, indexOfExistingToast),
								{
									...toasts[indexOfExistingToast],
									...toast
								},
								...toasts.slice(indexOfExistingToast + 1)
							];
						}

						return [toast, ...toasts];
					});
				});
			});
		});
	}, []);

	useEffect(() => {
		if (theme !== 'system') {
			setActualTheme(theme);
			return;
		}

		if (theme === 'system') {
			// check if current preference is dark
			if (
				window.matchMedia &&
				window.matchMedia('(prefers-color-scheme: dark)').matches
			) {
				// it's currently dark
				setActualTheme('dark');
			} else {
				// it's not dark
				setActualTheme('light');
			}
		}

		if (typeof window === 'undefined') {
			return;
		}
		const darkMediaQuery = window.matchMedia(
			'(prefers-color-scheme: dark)'
		);

		try {
			// Chrome & Firefox
			darkMediaQuery.addEventListener('change', ({ matches }) => {
				if (matches) {
					setActualTheme('dark');
				} else {
					setActualTheme('light');
				}
			});
		} catch {
			// Safari < 14
			darkMediaQuery.addListener(({ matches }) => {
				try {
					if (matches) {
						setActualTheme('dark');
					} else {
						setActualTheme('light');
					}
				} catch (e) {
					console.error(e);
				}
			});
		}
	}, [theme]);

	useEffect(() => {
		// Ensure expanded is always false when no toasts are present / only one left
		if (toasts.length <= 1) {
			setExpanded(false);
		}
	}, [toasts]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const isHotkeyPressed = hotkey.every(
				key => (event as any)[key] || event.code === key
			);

			if (isHotkeyPressed) {
				setExpanded(true);
				listRef.current?.focus();
			}

			if (
				event.code === 'Escape' &&
				(document.activeElement === listRef.current ||
					listRef.current?.contains(document.activeElement))
			) {
				setExpanded(false);
			}
		};
		document.addEventListener('keydown', handleKeyDown);

		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [hotkey]);

	useEffect(() => {
		if (listRef.current) {
			return () => {
				if (lastFocusedElementRef.current) {
					lastFocusedElementRef.current.focus({
						preventScroll: true
					});
					lastFocusedElementRef.current = null;
					isFocusWithinRef.current = false;
				}
			};
		}
	}, []);

	return (
		// Remove item from normal navigation flow, only available via hotkey
		<section
			aria-atomic='false'
			aria-label={`${containerAriaLabel} ${hotkeyLabel}`}
			aria-live='polite'
			aria-relevant='additions text'
			ref={ref}
			suppressHydrationWarning
			tabIndex={-1}
		>
			{possiblePositions.map((position, index) => {
				const [y, x] = position.split('-');

				if (!toasts.length) return null;

				return (
					<ol
						className={className}
						data-lifted={expanded && toasts.length > 1 && !expand}
						data-toastr
						data-toastr-theme={actualTheme}
						data-x-position={x}
						data-y-position={y}
						dir={dir === 'auto' ? getDocumentDirection() : dir}
						key={position}
						onBlur={event => {
							if (
								isFocusWithinRef.current &&
								!event.currentTarget.contains(
									event.relatedTarget
								)
							) {
								isFocusWithinRef.current = false;
								if (lastFocusedElementRef.current) {
									lastFocusedElementRef.current.focus({
										preventScroll: true
									});
									lastFocusedElementRef.current = null;
								}
							}
						}}
						onFocus={event => {
							const isNotDismissible =
								event.target instanceof HTMLElement &&
								event.target.dataset.dismissible === 'false';

							if (isNotDismissible) {
								return;
							}

							if (!isFocusWithinRef.current) {
								isFocusWithinRef.current = true;
								lastFocusedElementRef.current =
									event.relatedTarget as HTMLElement;
							}
						}}
						onMouseEnter={() => setExpanded(true)}
						onMouseMove={() => setExpanded(true)}
						onMouseLeave={() => {
							// Avoid setting expanded to false when interacting with a toast, e.g. swiping
							if (!interacting) {
								setExpanded(false);
							}
						}}
						onDragEnd={() => setExpanded(false)}
						onPointerDown={event => {
							const isNotDismissible =
								event.target instanceof HTMLElement &&
								event.target.dataset.dismissible === 'false';

							if (isNotDismissible) {
								return;
							}
							setInteracting(true);
						}}
						onPointerUp={() => setInteracting(false)}
						ref={listRef}
						tabIndex={-1}
						style={{
							// @ts-expect-error
							'--front-toast-height': `${heights[0]?.height || 0}px`,
							'--width': `${TOAST_WIDTH}px`,
							'--gap': `${gap || GAP}px`,
							...style,
							...assignOffset(offset, mobileOffset)
						}}
					>
						{toasts
							.filter(
								toast =>
									(!toast.position && index === 0) ||
									toast.position === position
							)
							.map((toast, index) => (
								<Toast
									key={toast.id}
									actionButtonStyle={
										toastOptions?.actionButtonStyle
									}
									cancelButtonStyle={
										toastOptions?.cancelButtonStyle
									}
									className={toastOptions?.className}
									classNames={toastOptions?.classNames}
									closeButton={
										toastOptions?.closeButton ??
										closeButton ??
										false
									}
									closeButtonAriaLabel={
										toastOptions?.closeButtonAriaLabel
									}
									defaultRichColors={richColors}
									descriptionClassName={
										toastOptions?.descriptionClassName
									}
									duration={
										toastOptions?.duration ?? duration
									}
									expandByDefault={expand ?? false}
									expanded={expanded}
									gap={gap}
									heights={heights.filter(
										h => h.position == toast.position
									)}
									icons={icons}
									index={index}
									interacting={interacting}
									invert={invert ?? false}
									position={position}
									removeToast={removeToast}
									setHeights={setHeights}
									style={toastOptions?.style}
									swipeDirections={props.swipeDirections}
									toast={toast}
									toasts={toasts.filter(
										t => t.position == toast.position
									)}
									unstyled={toastOptions?.unstyled}
									visibleToasts={visibleToasts}
								/>
							))}
					</ol>
				);
			})}
		</section>
	);
});

export { toast, Toastr, useToastr };
