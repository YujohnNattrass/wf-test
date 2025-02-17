import { mastra } from "./index";

const myWorkflow = mastra.getWorkflow('myWorkflow');
const { runId, start } = myWorkflow.createRun();
  
  
  
//   // The watch method works in this case
myWorkflow.watch(async ({ context, activePaths }) => {
    
    for (const _path of activePaths) {
      // console.log(`stepTwoStatus`, JSON.stringify(context.steps, null, 2));
      const stepTwoStatus = context.steps?.stepTwo?.status;
      if (stepTwoStatus === 'suspended') {
        await myWorkflow.resume({
          runId,
          stepId: 'stepTwo',
          context: { secondValue: 100 },
        });
      }
    }
  })
  
  const startRes = await start({ triggerData: { inputValue: 45 } });


console.log(`startRes`, JSON.stringify(startRes, null, 2));
// startRes {
//   "triggerData": {
//     "inputValue": 45
//   },
//   "results": {
//     "stepOne": {
//       "status": "success",
//       "output": {
//         "doubledValue": 90
//       }
//     },
//     "stepTwo": {
//       "status": "suspended" <------- stil suspended.
//     }
//   },
//   "runId": "5f11da29-9eeb-4938-8408-7dc5a77011f4"
// }

// console.log(`watchRes`, JSON.stringify(watchRes, null, 2));
// watchRes {
//   "runId": "5f11da29-9eeb-4938-8408-7dc5a77011f4",
//   "value": {
//     "stepOne": {
//       "stepTwo": "completed"
//     }
//   },
//   "context": {
//     "steps": {
//       "stepOne": {
//         "status": "success",
//         "output": {
//           "doubledValue": 90
//         }
//       },
//       "stepTwo": {
//         "status": "success",
//         "output": {
//           "incrementedValue": 190
//         }
//       }
//     },
//     "triggerData": {
//       "inputValue": 45
//     },
//     "attempts": {
//       "stepOne": 3,
//       "stepTwo": 3
//     },
//     "_snapshot": {
//       "stepId": "stepTwo"
//     }
//   },
//   "activePaths": [
//     {
//       "stepPath": [
//         "stepOne",
//         "stepTwo"
//       ],
//       "stepId": "stepTwo",
//       "status": "completed"
//     }
//   ],
//   "timestamp": 1739799974785
// }