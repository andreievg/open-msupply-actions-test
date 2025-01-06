import React from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import { GradientStops } from './_gradient';

export const LiverIcon = (props: SvgIconProps): JSX.Element => (
  <SvgIcon {...props} viewBox="0 0 60 60" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M32.3983 17.823C32.3268 17.3578 31.9332 17 31.468 17H30.0367C24.9199 17 21.1271 17.3936 19.0517 18.145C12.1458 20.7213 12.5752 26.2675 13.5413 31.277C13.8634 33.0303 14.1854 35.213 14.4359 37.7892C14.5432 38.7554 15.0799 39.5426 15.9745 39.9362C16.869 40.3298 17.8709 40.2224 18.6581 39.6141C20.3399 38.3975 22.451 37.1094 25.1346 35.7139C33.114 31.6348 32.8635 21.8305 32.3983 17.823ZM34.0085 34.7478C33.7223 33.9606 33.3645 33.1734 32.8993 32.422C32.0405 33.9248 30.8955 35.3203 29.4285 36.5369C29.5 36.6443 29.5716 36.7158 29.6432 36.7874C30.645 38.326 31.2533 40.3656 31.3965 42.4767C31.5038 44.1942 31.5396 46.0191 31.468 47.844C31.4322 48.3091 31.7901 48.667 32.2552 48.667H34.1874C34.6526 48.667 34.9746 48.3091 34.9746 47.844C34.9182 46.4323 34.9508 45.0206 34.9847 43.5562V43.5562C34.9937 43.1647 35.0029 42.7694 35.0104 42.3694C35.0462 39.972 34.9389 37.3957 34.0085 34.7478ZM45.1366 17.7872C45.8523 17.8587 46.4606 18.2881 46.7826 18.9322C47.1046 19.5763 47.0689 20.3277 46.6753 20.9002C44.4568 24.1563 40.8786 28.0208 35.6544 29.9172C34.9746 30.1677 34.3305 29.5236 34.5452 28.8795C35.8334 24.9077 35.7618 20.8286 35.5113 18.2165C35.4398 17.644 35.9049 17.1431 36.4774 17.1789C39.1611 17.322 42.0594 17.5009 45.1366 17.7872Z"
      fill="url(#paint0_linear_247_41575)"
    />
    <defs>
      <linearGradient
        id="paint0_linear_247_41575"
        x1="30"
        y1="17"
        x2="30"
        y2="48.667"
        gradientUnits="userSpaceOnUse"
      >
        <GradientStops />
      </linearGradient>
    </defs>
  </SvgIcon>
);
