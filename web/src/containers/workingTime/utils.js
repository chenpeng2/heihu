// @flow
import { replaceSign } from 'src/constants';

type TimeType = { hour: number, minute: number };
type TimeBucketType = {
  startTime: TimeType,
  endTime: TimeType,
};
type TimeBucketArrayType = Array<TimeBucketType>;

export const calcTotalTime = (timeBuckets: TimeBucketArrayType): TimeType => {
  let totalTimeByMinutes = 0;

  // 将小时转换为分钟，来计算时间跨度
  timeBuckets.forEach(({ startTime, endTime }: TimeBucketType): any => {
    totalTimeByMinutes += (Number(endTime.hour) * 60 + Number(endTime.minute) - Number(startTime.hour) * 60 - Number(startTime.minute));
  });

  return { hour: Math.floor(totalTimeByMinutes / 60), minute: totalTimeByMinutes % 60 };
};


type InitialTimeBucketType = {
  startTime: string,
  endTime: string
};
type InitialTimeBucketArrayType = Array<InitialTimeBucketType>;

export const getTotalTime = (periods: InitialTimeBucketArrayType): string | null => {
    if (!periods) return null;

    const _periods: Array<TimeBucketType> = periods
      .map(({ startTime, endTime }: InitialTimeBucketType): TimeBucketType => {
        if (typeof startTime !== 'string' || typeof endTime !== 'string') {
          return {
            startTime: { hour: 0, minute: 0 },
            endTime: { hour: 0, minute: 0 },
          };
        }

        return {
          startTime: { hour: Number(startTime.split(':')[0]), minute: Number(startTime.split(':')[1]) },
          endTime: { hour: Number(endTime.split(':')[0]), minute: Number(endTime.split(':')[1]) },
        };
      });

    const { hour, minute } = calcTotalTime(_periods) || replaceSign;
    return `${hour}小时${minute}分钟`;
  };

export const formatTimeToString = (time: number): string => {
  if (time.toString().length === 1) {
    return `0${time}`;
  }

  return time.toString();
};

export default 'dummy';
