export const formatTime = (ms) => {
    const totalSeconds = Math.round(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
};
export const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;
