// // src/hooks/use-foreshadowing.ts
// import { useEffect, useState } from 'react';
// import { getForeshadowingData } from '@/lib/foreshadowing/engine';
// import type { Foreshadowing } from '@/types/memory';

// export interface ForeshadowingStatistics {
//     totalCount: number;
//     resolvedCount: number;
//     pendingCount: number;
//     highPriorityCount: number;
//     mediumPriorityCount: number;
//     lowPriorityCount: number;
//     plannedResolutionCount: number;
// }

// export interface ForeshadowingLoadState {
//     foreshadowingElements: Foreshadowing[];
//     statistics: ForeshadowingStatistics | null;
//     isLoading: boolean;
//     error?: Error | null;
// }

// export function useForeshadowing(): ForeshadowingLoadState {
//     const [foreshadowings, setForeshadowings] = useState<Foreshadowing[] | null>(null);
//     const [statistics, setStatistics] = useState<ForeshadowingStatistics | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<Error | null>(null);

//     useEffect(() => {
//         let isMounted = true;

//         async function fetchForeshadowing() {
//             try {
//                 const data = await getForeshadowingData();
//                 if (isMounted) {
//                     setForeshadowings(data);

//                     const resolved = data.filter((e) => e.resolved);
//                     const pending = data.filter((e) => !e.resolved);
//                     const highPriority = data.filter((e) => e.urgency.toLowerCase() === 'high');
//                     const mediumPriority = data.filter((e) => e.urgency.toLowerCase() === 'medium');
//                     const lowPriority = data.filter((e) => e.urgency.toLowerCase() === 'low');
//                     const plannedResolution = pending.filter((e) => e.potential_resolution !== undefined);

//                     const stats: ForeshadowingStatistics = {
//                         totalCount: data.length,
//                         resolvedCount: resolved.length,
//                         pendingCount: pending.length,
//                         highPriorityCount: highPriority.length,
//                         mediumPriorityCount: mediumPriority.length,
//                         lowPriorityCount: lowPriority.length,
//                         plannedResolutionCount: plannedResolution.length,
//                     };

//                     setStatistics(stats);
//                 }
//             } catch (err) {
//                 if (isMounted) {
//                     setError(err as Error);
//                 }
//             } finally {
//                 if (isMounted) {
//                     setLoading(false);
//                 }
//             }
//         }

//         fetchForeshadowing();

//         return () => {
//             isMounted = false;
//         };
//     }, []);

//     return {
//         foreshadowingElements: foreshadowings ?? [],
//         statistics,
//         isLoading: loading,
//         error,
//     };

// }