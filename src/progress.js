export function completedLevels(data){return [...new Set([...(Array.isArray(data.completedLevels)?data.completedLevels.filter(n=>n===1||n===2):[]),...(data.completed?[1]:[])])]}
export function canSelectLevel(data,id){return id===1||(id===2&&completedLevels(data).includes(1))}
export function completeLevel(data,id){data.completedLevels=[...new Set([...completedLevels(data),id])];data.completed=data.completedLevels.includes(1)}
