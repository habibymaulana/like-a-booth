import {useEffect,useRef} from 'react';

export const FLASH_TIMING = {fadeIn:120,hold:60,fadeOut:300,total:480};

// The overlay owns its timeline so routing cannot accidentally unmount the fade-out.
// Web Animations is opacity-only; a watchdog also releases the navigation lock.
export default function FlashTransition({onPeak,onComplete}) {
  const overlay = useRef(null);
  const callbacks = useRef({onPeak,onComplete});
  callbacks.current = {onPeak,onComplete};

  useEffect(() => {
    const node = overlay.current;
    let navigated = false;
    let finished = false;
    const peak = () => {
      if (navigated || finished) return;
      navigated = true;
      callbacks.current.onPeak();
    };
    const finish = () => {
      if (finished) return;
      peak();
      finished = true;
      node.style.pointerEvents = 'none';
      callbacks.current.onComplete();
    };
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) {
      peak();
      finish();
      return;
    }
    const animation = node.animate(
      [{opacity:0,offset:0},{opacity:1,offset:FLASH_TIMING.fadeIn/FLASH_TIMING.total},
        {opacity:1,offset:(FLASH_TIMING.fadeIn+FLASH_TIMING.hold)/FLASH_TIMING.total},
        {opacity:0,offset:1}],
      {duration:FLASH_TIMING.total,easing:'linear',fill:'both'},
    );
    const navigationTimer = setTimeout(peak,FLASH_TIMING.fadeIn+FLASH_TIMING.hold/2);
    const watchdog = setTimeout(finish,FLASH_TIMING.total+150);
    animation.onfinish = finish;
    animation.oncancel = finish;
    // A tab switch or preference change should never leave an invisible blocker.
    const visibility = () => {if (document.hidden) finish();};
    const motionChange = () => {if (media.matches) finish();};
    document.addEventListener('visibilitychange',visibility);
    media.addEventListener('change',motionChange);
    return () => {
      finished = true;
      clearTimeout(navigationTimer);
      clearTimeout(watchdog);
      animation.onfinish = null;
      animation.oncancel = null;
      animation.cancel();
      document.removeEventListener('visibilitychange',visibility);
      media.removeEventListener('change',motionChange);
    };
  },[]);

  return <div ref={overlay} className="camera-flash" aria-hidden="true"/>;
}
