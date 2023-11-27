import React, { MutableRefObject, useRef } from 'react';
import { FlatList, FlatListProps, ScrollViewProps } from 'react-native';

export type Props<T> = Omit<
  FlatListProps<T>,
  'maintainVisibleContentPosition'
> & {
  ref?: React.ForwardedRef<FlatList>;
  /**
   * Called once when the scroll position gets close to end of list. This must return a promise.
   * You can `onEndReachedThreshold` as distance from end of list, when this function should be called.
   */
  onEndReached: () => Promise<void>;
  /**
   * Called once when the scroll position gets close to begining of list. This must return a promise.
   * You can `onStartReachedThreshold` as distance from beginning of list, when this function should be called.
   */
  onStartReached: () => Promise<void>;
  /** Color for inline loading indicator */
  activityIndicatorColor?: string;
  /**
   * Enable autoScrollToTop.
   * In chat type applications, you want to auto scroll to bottom, when new message comes it.
   */
  enableAutoscrollToTop?: boolean;
  /**
   * If `enableAutoscrollToTop` is true, the scroll threshold below which auto scrolling should occur.
   */
  autoscrollToTopThreshold?: number;
  /** Scroll distance from beginning of list, when onStartReached should be called. */
  onStartReachedThreshold?: number;
  /**
   * Scroll distance from end of list, when onStartReached should be called.
   * Please note that this is different from onEndReachedThreshold of FlatList from react-native.
   */
  onEndReachedThreshold?: number;
};
/**
 * Note:
 * - `onEndReached` and `onStartReached` must return a promise.
 * - `onEndReached` and `onStartReached` only get called once, per content length.
 * - maintainVisibleContentPosition is fixed, and can't be modified through props.
 * - doesn't accept `ListFooterComponent` via prop, since it is occupied by `FooterLoadingIndicator`.
 * Set `showDefaultLoadingIndicators` to use `ListFooterComponent`.
 * - doesn't accept `ListHeaderComponent` via prop, since it is occupied by `HeaderLoadingIndicator`
 * Set `showDefaultLoadingIndicators` to use `ListHeaderComponent`.
 */
export const BidirectionalFlatList = React.forwardRef(
  <T extends Element>(
    props: Props<T>,
    ref:
      | ((instance: FlatList<T> | null) => void)
      | MutableRefObject<FlatList<T> | null>
      | null,
  ) => {
    const {
      autoscrollToTopThreshold = 100,
      data,
      enableAutoscrollToTop,
      onEndReached = () => Promise.resolve(),
      onEndReachedThreshold = 10,
      onScroll,
      onStartReached = () => Promise.resolve(),
      onStartReachedThreshold = 10,
    } = props;

    const onStartReachedTracker = useRef<Record<number, boolean>>({});
    const onEndReachedTracker = useRef<Record<number, boolean>>({});

    const onStartReachedInPromise = useRef<Promise<void> | null>(null);
    const onEndReachedInPromise = useRef<Promise<void> | null>(null);

    const maybeCallOnStartReached = () => {
      // If onStartReached has already been called for given data length, then ignore.
      if (data?.length && onStartReachedTracker.current[data.length]) {
        return;
      }

      if (data?.length) {
        onStartReachedTracker.current[data.length] = true;
      }

      const p = () => {
        return new Promise<void>(resolve => {
          onStartReachedInPromise.current = null;
          resolve();
        });
      };

      if (onEndReachedInPromise.current) {
        onEndReachedInPromise.current.finally(() => {
          onStartReachedInPromise.current = onStartReached().then(p);
        });
      } else {
        onStartReachedInPromise.current = onStartReached().then(p);
      }
    };

    const maybeCallOnEndReached = () => {
      // If onEndReached has already been called for given data length, then ignore.
      if (data?.length && onEndReachedTracker.current[data.length]) {
        return;
      }

      if (data?.length) {
        onEndReachedTracker.current[data.length] = true;
      }

      const p = () => {
        return new Promise<void>(resolve => {
          onStartReachedInPromise.current = null;
          resolve();
        });
      };

      if (onStartReachedInPromise.current) {
        onStartReachedInPromise.current.finally(() => {
          onEndReachedInPromise.current = onEndReached().then(p);
        });
      } else {
        onEndReachedInPromise.current = onEndReached().then(p);
      }
    };

    const handleScroll: ScrollViewProps['onScroll'] = event => {
      // Call the parent onScroll handler, if provided.
      onScroll?.(event);

      const offset = event.nativeEvent.contentOffset.y;
      const visibleLength = event.nativeEvent.layoutMeasurement.height;
      const contentLength = event.nativeEvent.contentSize.height;

      // Check if scroll has reached either start of end of list.
      const isScrollAtStart = offset < onStartReachedThreshold;
      const isScrollAtEnd =
        contentLength - visibleLength - offset < onEndReachedThreshold;

      if (isScrollAtStart) {
        maybeCallOnStartReached();
      }

      if (isScrollAtEnd) {
        maybeCallOnEndReached();
      }
    };

    return (
      <FlatList<T>
        {...props}
        ref={ref}
        progressViewOffset={50}
        onEndReached={null}
        onScroll={handleScroll}
        maintainVisibleContentPosition={{
          autoscrollToTopThreshold: enableAutoscrollToTop
            ? autoscrollToTopThreshold
            : undefined,
          minIndexForVisible: 1,
        }}
      />
    );
  },
) as unknown as BidirectionalFlatListType;

type BidirectionalFlatListType = <T extends Element>(
  props: Props<T>,
) => React.ReactElement;
