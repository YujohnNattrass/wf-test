import { DefaultStorage } from '@mastra/core/storage';
import { Step, Workflow } from '@mastra/core/workflows';
import { z } from 'zod';
 
const stepOne = new Step({
  id: 'stepOne',
  outputSchema: z.object({
    doubledValue: z.number(),
  }),
  execute: async ({ context }) => {
    const doubledValue = context.triggerData.inputValue * 2;
    return { doubledValue };
  },
});
 
const stepTwo = new Step({
  id: 'stepTwo',
  outputSchema: z.object({
    incrementedValue: z.number(),
  }),
  execute: async ({ context, suspend }) => {
    let stepValue = 0;
    if (context.steps?.stepTwo?.status === 'success') {
      stepValue = context.steps.stepTwo?.output.secondValue
    }

    let incrementedValue = 0;
    if (context.steps?.stepOne?.status === 'success') {
      incrementedValue = context.steps.stepOne.output.doubledValue + stepValue
    }
    
    if (incrementedValue < 100) {
      await suspend();
      return { incrementedValue: 0 };
    }

    return { incrementedValue };
  },
});

const storage = new DefaultStorage({
  config: {
    url: ':memory:',
  },
});
 
// Build the workflow
const myWorkflow = new Workflow({
  name: 'my-workflow',
  triggerSchema: z.object({
    inputValue: z.number(),
  }),
  mastra: {
    storage,
    // logger: createLogger({ name: 'workflow', level: 'debug' }),
  },
});
 
// run workflows in parallel
myWorkflow
  .step(stepOne)
  .then(stepTwo)
  .commit();
 
  const { runId, start } = myWorkflow.createRun();
  
  
const startRes = await start({ triggerData: { inputValue: 45 } });

// The watch method works in this case
const watchRes = await myWorkflow.watch(runId, {
  onTransition: async ({ context, activePaths }) => {
    
    for (const _path of activePaths) {
      console.log(`stepTwoStatus`, JSON.stringify(context.steps, null, 2));
      const stepTwoStatus = context.steps?.stepTwo?.status;
      if (stepTwoStatus === 'suspended') {
        await myWorkflow.resume({
          runId,
          stepId: 'stepTwo',
          context: { secondValue: 100 },
        });
      }
    }
  }
})



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

console.log(`watchRes`, JSON.stringify(watchRes, null, 2));
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