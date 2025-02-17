import { Mastra } from '@mastra/core';
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

// const storage = new DefaultStorage({
//   config: {
//     url: ':memory:',
//   },
// });
 
// Build the workflow
const myWorkflow = new Workflow({
  name: 'my-workflow',
  triggerSchema: z.object({
    inputValue: z.number(),
  }),
});

// run workflows in parallel
myWorkflow
  .step(stepOne)
  .then(stepTwo)
  .commit();


export const mastra = new Mastra({
  workflows: {myWorkflow},
})
 
