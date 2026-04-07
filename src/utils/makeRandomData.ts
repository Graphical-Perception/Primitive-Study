import seedrandom from 'seedrandom';
import { ComponentBlock, ReactComponent, StudyConfig } from "../parser/types";

// const DEFAULT_TIME_LIMIT: number = 10000; // TEST
const DEFAULT_TIME_LIMIT: number = 100; // 0.1초

const study_times: Record<string, Record<string, number>> = {
  accuracy: {
    SJW: 1,
    Study: 2,
    Disc: 0,
    Deploy: 1,
  },
  disc: {
    SJW: 1,
    Study: 10,
    Disc: 30,
    Deploy: 1,
  },
  sep: {
    SJW: 1,
    Study: 1,
    Disc: 0,
    Deploy: 1,
  },
  popout: {
    SJW: 1,
    Study: 0,
    Disc: 3,
    Deploy: 1,
  },
}


export function makeRandomData(data: StudyConfig) {
  // return data

  const accuracy_study_times = study_times.accuracy[data.studyMetadata.version] ?? 1;
  const disc_study_times = study_times.disc[data.studyMetadata.version] ?? 1;
  const separability_study_times = study_times.sep[data.studyMetadata.version] ?? 1;
  const popout_study_times = study_times.popout[data.studyMetadata.version] ?? 1;

  let mturkPid = null;
  const queryParameters = new URLSearchParams(window.location.search);

  if (queryParameters.has('RequesterID')) {
    mturkPid = queryParameters.get('RequesterID') as string;
  }
  else if (window.location.pathname.includes('SJW') || data.studyMetadata.version === 'Deploy') {
    const randommturkPid = Math.random().toString(36).substring(7);
    queryParameters.set('RequesterID', randommturkPid);

    window.location.href = `${window.location.pathname}?${queryParameters.toString()}`;
  }
  else {
    data.sequence.components = ["error"]
    data.uiConfig['studyEndMsg'] = `<div style='text-align: center;'>RequesterID is required.</div>`;
    return data;
    // throw new Error('RequesterID is required');
    // mturkPid = Math.random().toString(36).substring(7);
    // queryParameters.set('RequesterID', mturkPid);
    // window.location.href = `${window.location.pathname}?${queryParameters.toString()}`;
  }

  if (mturkPid === null) {
    data.sequence.components = ["error"]
    data.uiConfig['studyEndMsg'] = `<div style='text-align: center;'>RequesterID is required.</div>`;
    return data;
    // throw new Error('RequesterID is required');
  }

  // make hash with mturkPid and include it in studyEndMsg, and also make it copyable
  generateHash(mturkPid).then(mturkHash => {
    data.uiConfig['studyEndMsg'] = `**<div style='text-align: center;'>Thank you for completing the study.</div><br>
      <div style='text-align: center;'>Please copy the code below and paste it into the MTurk page to receive your payment.</div><br>
      <div style='text-align: center;'>
        <strong>Your Code:</strong>
        <pre id='hash-code' style='background-color: #f4f4f4; padding: 10px; border-radius: 5px; display: inline-block;'>${mturkHash}</pre>
      </div>
            <div style='text-align: center;'>
        <button data-copy='${mturkHash}' style='text-align: center; margin-left: 10px; padding: 5px 10px; border-radius: 5px; background-color: #007bff; color: white; border: none; cursor: pointer;'>Copy to Clipboard</button>
        </div>**`;
    data.components.introduction.correctAnswer = [
      {
        id: "MTurk_ID",
        answer: mturkHash
      }
    ]
  });

  // const mturkPid = Array.from({ length: 50 }, () => Math.random().toString(36).charAt(2)).join('');
  // const mturkHash = mturkPid

  // data.uiConfig['studyEndMsg'] = `<div style='text-align: center;'>Thank you for completing the study.</div><br>
  // <div style='text-align: center;'>Please copy the code below and paste it into the MTurk page to receive your payment.</div><br>
  // <div style='text-align: center;'>
  //   <strong>Your Code:</strong>
  //   <pre id='hash-code' style='background-color: #f4f4f4; padding: 10px; border-radius: 5px; display: inline-block;'>${mturkHash}</pre>
  // </div>
  //       <div style='text-align: center;'>
  //   <button data-copy='${mturkHash}' style='text-align: center; margin-left: 10px; padding: 5px 10px; border-radius: 5px; background-color: #007bff; color: white; border: none; cursor: pointer;'>Copy to Clipboard</button>
  //   </div>`;
  // data.components.introduction.correctAnswer = [
  //   {
  //     id: "MTurk_ID",
  //     answer: mturkHash
  //   }
  // ]



  const rng = seedrandom(mturkPid);
  // const rng = seedrandom();

  // Accuracy Study
  const accuracy_sequence = data.sequence.components.find((element) => { return typeof element === 'object' && element.id === "Accuracy" }) as ComponentBlock
  if (accuracy_sequence) {
    for (let i in accuracy_sequence.components) {
      if (typeof accuracy_sequence.components[i] !== 'object') continue;
      const component_block = accuracy_sequence.components[i] as ComponentBlock

      const components_copy = [...component_block.components]
      component_block.components = []
      for (let component_name of components_copy) {
        if (typeof component_name !== 'string') continue;
        const component = data.components[component_name] as ReactComponent
        delete data.components[component_name]
        for (let j = 0; j < accuracy_study_times; j++) {
          const new_component_name = accuracy_study_times === 1 ? component_name : `${component_name}-${j}`
          data.components[new_component_name] = JSON.parse(JSON.stringify(component))
          component_block.components.push(new_component_name)
        }
      }
    }
  }




  // Discriminability Study
  const channel_list = ['length', 'tilt', 'area', 'curvature', 'luminance', 'saturation'];


  channel_list.forEach((channel) => {
    const sep_sequence = data.sequence.components.find((element) => { return typeof element === 'object' && element.id === "Discriminability" }) as ComponentBlock
    const channel_component = sep_sequence.components.find((element) => { return typeof element === 'object' && element.id === channel }) as ComponentBlock
    // const channel_component = sep_sequence.components.find((element) => { return typeof element === 'object' && element.id === 'Overall' }) as ComponentBlock

    for (let i = 0; i < disc_study_times; i++) {

      const disc_study_name = disc_study_times === 1 ? `${channel}-discriminability` : `${channel}-disc-${i}`
      data.components[disc_study_name] = {
        "type": "react-component",
        "path": "Graphical-Perception/assets/Discriminability/Study.tsx",
        "parameters": {
          "taskid": disc_study_name,
          "test": false,
          [disc_study_name]: channel === 'curvature' || channel === 'tilt' ? "disc(180)" : "disc(100)",
        },
        "instruction": "Are the two element **different** in terms of **" + channel + "** ?",
        "response": [
          {
            "id": disc_study_name,
            "prompt": "",
            "required": true,
            "type": "radio",
            "location": "sidebar",
            "options": [{ "label": "Same " + channel, "value": "Same" }, { "label": "Different " + channel, "value": "Different" }],
          }
        ],
        "nextButtonLocation": "sidebar",
        "nextButtonText": "Next or Press Enter"
      }
      channel_component.components.push(disc_study_name);
    }
  })


  // Separability Study
  const channel_combinations = [
    ["length", "position"],
    ["length", "tilt"],
    ["length", "luminance"],
    ["length", "saturation"],
    ["length", "curvature"],
    ["tilt", "length"],
    ["tilt", "area"],
    ["tilt", "luminance"],
    ["tilt", "saturation"],
    ["tilt", "curvature"],
    ["area", "position"],
    ["area", "tilt"],
    ["area", "luminance"],
    ["area", "saturation"],
    ["curvature", "length"],
    ["curvature", "tilt"],
    ["curvature", "luminance"],
    ["curvature", "saturation"],
    ["luminance", "length"],
    ["luminance", "tilt"],
    ["luminance", "area"],
    ["luminance", "curvature"],
    ["luminance", "saturation"],
    ["saturation", "length"],
    ["saturation", "tilt"],
    ["saturation", "area"],
    ["saturation", "curvature"],
    ["saturation", "luminance"],
  ]

  const instruction_map: Record<string, { instruction: string, prompt: string }> = {
    "length": {
      "instruction": "How **long** is the line of the total length? (0 ~ 100%)",
      "prompt": "Length %"
    },
    "tilt": {
      "instruction": "Predict **tilted** angle of the element? (0° ~ 180°)",
      "prompt": "Tilt °"
    },
    "area": {
      "instruction": "Predict the **area** of the square by the total area? (0 ~ 100%)",
      "prompt": "Area %"
    },
    "curvature": {
      "instruction": "Predict the **curvature** of the element? (0° ~ 180°)",
      "prompt": "Curvature °"
    },
    "luminance": {
      "instruction": "Predict the **luminance** of the element? (0 ~ 100%)",
      "prompt": "Luminance %"
    },
    "saturation": {
      "instruction": "Predict the **saturation** of the element? (0 ~ 100%)",
      "prompt": "Saturation %"
    },
  }


  //separability as accuracy
  channel_combinations.forEach(([channel1, channel2]) => {
    const sep_sequence = data.sequence.components.find((element) => { return typeof element === 'object' && element.id === "Accuracy" }) as ComponentBlock
    if (!sep_sequence) return;

    const channel1_component = sep_sequence.components.find((element) => { return typeof element === 'object' && element.id === channel1 }) as ComponentBlock


    for (let i = 0; i < separability_study_times; i++) {
      const sep_study_name = separability_study_times === 1 ? `${channel1}-${channel2}-separability` : `${channel1}-sep-${channel2}-${i}`
      data.components[sep_study_name] = {
        "type": "react-component",
        "path": "Graphical-Perception/assets/Separability_Accuracy/Study.tsx",
        "parameters": {
          "taskid": channel1,
          "test": false,
          [channel1]: (channel1 === 'area' && channel2 === 'tilt' ? "random(0, 50)" : (channel1 === 'tilt' && channel2 === 'area' ? "random(0, 45)" : (channel1 === 'curvature' || channel1 === 'tilt' ? "random(0, 180)" : (channel2 === 'position' ? (channel1 === 'area' ? "random(0, 25)" : "random(0, 50)") : "random(0, 100)")))),
          "compared": channel2,
        },
        "instruction": instruction_map[channel1].instruction,
        "response": [
          {
            "id": sep_study_name,
            "prompt": instruction_map[channel1].prompt,
            "required": true,
            "location": "sidebar",
            "type": "numerical"
          }
        ],
        "nextButtonLocation": "sidebar",
        "nextButtonText": "Next or Press Enter"
      }
      channel1_component.components.push(sep_study_name);
    }

  })

  // separability as discriminability
  // channel_combinations.forEach(([channel1, channel2]) => {


  //   // const sep_sequence = data.sequence.components.find((element) => { return typeof element === 'object' && element.id === "Separability" }) as ComponentBlock
  //   const sep_sequence = data.sequence.components.find((element) => { return typeof element === 'object' && element.id === "Discriminability" }) as ComponentBlock
  //   const channel1_component = sep_sequence.components.find((element) => { return typeof element === 'object' && element.id === channel1 }) as ComponentBlock


  //   for (let i = 0; i < separability_study_times; i++) {
  //     const sep_study_name = `${channel1}-sep-${channel2}-${i}`
  //     data.components[sep_study_name] = {
  //       "type": "react-component",
  //       "path": "Graphical-Perception/assets/Separability_Discriminability/Study.tsx",
  //       "parameters": {
  //         "taskid": channel1,
  //         "test": false,
  //         [channel1]: (channel1 === 'area' && channel2 === 'tilt' ? "disc(50)" : (channel1 === 'tilt' && channel2 === 'area' ? "disc(45)" : (channel1 === 'curvature' || channel1 === 'tilt' ? "disc(180)" : (channel2 === 'position' ? (channel1 === 'area' ? "disc(25)" : "disc(50)") : "disc(100)")))),
  //         "compared": channel2,
  //         "time_limit": "default"
  //       },
  //       "instruction": "Are the two element **different** in terms of **" + channel1 + "**?",
  //       "response": [
  //         {
  //           "id": sep_study_name,
  //           "prompt": "",
  //           "required": true,
  //           "type": "radio",
  //           "location": "sidebar",
  //           "options": [{ "label": "Same " + channel1, "value": "Same" }, { "label": "Different " + channel1, "value": "Different" }],
  //           // "type": "matrix-radio",
  //           // "answerOptions": ["length", "curvature"],
  //           // "questionOptions": [
  //           //   "Same",
  //           //   "Different"
  //           // ]
  //         }
  //       ],
  //       "nextButtonLocation": "sidebar"
  //     }
  //     channel1_component.components.push(sep_study_name);
  //   }

  //   // data.sequence.components[sep_index].components[channel1_index]

  // })

  // Popout Study
  const popout_sequence = data.sequence.components.find((element) => { return typeof element === 'object' && element.id === "Popout" }) as ComponentBlock
  for (let i in popout_sequence.components) {
    if (typeof popout_sequence.components[i] !== 'object') continue;
    const component_block = popout_sequence.components[i] as ComponentBlock

    const components_copy = [...component_block.components]
    component_block.components = []
    for (let component_name of components_copy) {
      if (typeof component_name !== 'string') continue;
      const component = data.components[component_name] as ReactComponent
      delete data.components[component_name]
      for (let j = 0; j < popout_study_times; j++) {
        const new_component_name = popout_study_times === 1 ? component_name : `${component_name}-${j}`
        data.components[new_component_name] = JSON.parse(JSON.stringify(component))
        component_block.components.push(new_component_name)
      }
    }

  }



  Object.keys(data.components).forEach((key: string) => {
    const component = data.components[key];
    if (component.type === 'react-component' && typeof component.parameters === 'object' && component.parameters !== undefined) {

      for (const paramKey in component.parameters) {

        let paramValue = component.parameters[paramKey];
        // 1. 단일 random(x, y) 처리
        if (typeof paramValue === 'string' && /^random\(\d+,\s*\d+\)$/.test(paramValue)) {
          component.parameters[paramKey] = generateRandomFromPattern(paramValue, rng);
          updateCorrectAnswer(component, paramKey, component.parameters[paramKey]);
        }

        //2. "disc(number)" 처리
        else if (typeof paramValue === 'string' && /^disc\(\d+\)$/.test(paramValue)) {
          const randomMatch = paramValue.match(/\d+/g);
          const leftRandomNum = randomMatch
            ? Math.floor(rng() * (parseInt(randomMatch[0]) + 1))
            : Math.round(rng() * 100);
          // make rightRandomNum - (30% of leftRandomNum + 5) ~ (30% of leftRandomNum + 5) of leftRandomNum

          const minVal = Math.max(0, leftRandomNum - (leftRandomNum) * 0.1 - 5);
          const maxVal = Math.min(randomMatch ? parseInt(randomMatch[0]) : leftRandomNum, leftRandomNum + (leftRandomNum) * 0.1 + 5);

          const rightRandomNum = Math.floor(minVal + rng() * (maxVal - minVal));

          // const [leftRandomNum, rightRandomNum] = [5, randomMatch ? parseInt(randomMatch[0]) - 20 : 50] // TEST
          component.parameters[paramKey] = [leftRandomNum, rightRandomNum];
          updateCorrectAnswer(component, key, component.parameters[paramKey]);
        }

        // // 2. 배열 형태의 random(x, y) 처리
        // else if (typeof paramValue === 'string' && paramValue.trim().startsWith('[') && paramValue.trim().endsWith(']')) {
        //   const extractedValues = extractAndReplaceRandomValues(paramValue, rng);
        //   component.parameters[paramKey] = extractedValues;
        //   updateCorrectAnswer(component, paramKey, extractedValues);
        // }

        // 3. random(boolean) 처리
        else if (typeof paramValue === 'string' && paramValue === 'random(boolean)') {
          const randomBool = rng() < 0.5;
          // const randomBool = true // TEST
          component.parameters[paramKey] = randomBool;
          updateCorrectAnswer(component, paramKey, randomBool);
        }

        // 4. 기본 time_limit 처리
        else if (paramKey === 'time_limit' && typeof paramValue === 'string' && paramValue === 'default') {
          component.parameters[paramKey] = DEFAULT_TIME_LIMIT;
        }
        else {
        }
      }
    }
  });

  return data;
}

export function makeDiscData(data: StudyConfig) {
  // return data

  const disc_study_times = study_times.disc[data.studyMetadata.version] ?? 1;
  const popout_study_times = study_times.popout[data.studyMetadata.version] ?? 1;

  let mturkPid = null;
  const queryParameters = new URLSearchParams(window.location.search);

  if (queryParameters.has('RequesterID')) {
    mturkPid = queryParameters.get('RequesterID') as string;
  }
  else if (window.location.pathname.includes('SJW')) {
    const randommturkPid = Math.random().toString(36).substring(7);
    queryParameters.set('RequesterID', randommturkPid);

    window.location.href = `${window.location.pathname}?${queryParameters.toString()}`;
  }
  else {
    data.sequence.components = ["error"]
    data.uiConfig['studyEndMsg'] = `<div style='text-align: center;'>RequesterID is required.</div>`;
    return data;
  }

  if (mturkPid === null) {
    data.sequence.components = ["error"]
    data.uiConfig['studyEndMsg'] = `<div style='text-align: center;'>RequesterID is required.</div>`;
    return data;
  }

  // make hash with mturkPid and include it in studyEndMsg, and also make it copyable
  generateHash(mturkPid).then(mturkHash => {
    data.uiConfig['studyEndMsg'] = `**<div style='text-align: center;'>Thank you for completing the study.</div><br>
      <div style='text-align: center;'>Please copy the code below and paste it into the MTurk page to receive your payment.</div><br>
      <div style='text-align: center;'>
        <strong>Your Code:</strong>
        <pre id='hash-code' style='background-color: #f4f4f4; padding: 10px; border-radius: 5px; display: inline-block;'>${mturkHash}</pre>
      </div>
            <div style='text-align: center;'>
        <button data-copy='${mturkHash}' style='text-align: center; margin-left: 10px; padding: 5px 10px; border-radius: 5px; background-color: #007bff; color: white; border: none; cursor: pointer;'>Copy to Clipboard</button>
        </div>**`;
    data.components.introduction.correctAnswer = [
      {
        id: "MTurk_ID",
        answer: mturkHash
      }
    ]
  });



  const rng = seedrandom(mturkPid);
  // const rng = seedrandom();


  // Discriminability Study
  const channel_list = ['length', 'tilt', 'area', 'curvature', 'luminance', 'saturation'];


  // add training session

  channel_list.forEach((channel) => {
    const seq_sequence = data.sequence.components.find((element) => { return typeof element === 'object' && element.id === "Discriminability" }) as ComponentBlock
    const channel_component = seq_sequence.components.find((element) => { return typeof element === 'object' && element.id === channel }) as ComponentBlock

    // add two training session for each channel, one for same and one for different

    const disc_study_name = `${channel}-disc-train-same`
    const same_train_rng = rng()
    data.components[disc_study_name] = {
      "type": "react-component",
      "path": "Graphical-Perception/assets/Discriminability/Study.tsx",
      "parameters": {
        "taskid": disc_study_name,
        "test": false,
        [disc_study_name]: channel === 'curvature' || channel === 'tilt' ? [same_train_rng * 140 + 20, same_train_rng * 140 + 20] : [same_train_rng * 80 + 10, same_train_rng * 80 + 10]
      },
      "instruction": "Are the two element **different** in terms of **" + channel + "** ?",
      "response": [
        {
          "id": disc_study_name,
          "prompt": "",
          "required": true,
          "type": "radio",
          "location": "sidebar",
          "options": [{ "label": "Same " + channel, "value": "Same" }, { "label": "Different " + channel, "value": "Different" }],
        }
      ],
      "correctAnswer": [
        {
          "id": disc_study_name,
          "answer": "Same"
        }
      ],
      "provideFeedback": true,
      "allowFailedTraining": false,
      "trainingAttempts": 2,
      "nextButtonLocation": "sidebar",
      "nextButtonText": "Next or Press Enter"
    }

    channel_component.components.push(disc_study_name);

    const disc_study_name_diff = `${channel}-disc-train-diff`
    const diff_train_rng = rng()

    data.components[disc_study_name_diff] = {
      "type": "react-component",
      "path": "Graphical-Perception/assets/Discriminability/Study.tsx",
      "parameters": {
        "taskid": disc_study_name_diff,
        "test": false,
        [disc_study_name_diff]: channel === 'curvature' || channel === 'tilt' ? [diff_train_rng * 120 + 10, diff_train_rng * 120 + 40] : [diff_train_rng * 50 + 5, diff_train_rng * 50 + 30]
      },
      "instruction": "Are the two element **different** in terms of **" + channel + "** ?",
      "response": [
        {
          "id": disc_study_name_diff,
          "prompt": "",
          "required": true,
          "type": "radio",
          "location": "sidebar",
          "options": [{ "label": "Same " + channel, "value": "Same" }, { "label": "Different " + channel, "value": "Different" }],
        }
      ],
      "correctAnswer": [
        {
          "id": disc_study_name_diff,
          "answer": "Different"
        }
      ],
      "provideFeedback": true,
      "allowFailedTraining": false,
      "trainingAttempts": 2,
      "nextButtonLocation": "sidebar",
      "nextButtonText": "Next or Press Enter"
    }

    channel_component.components.push(disc_study_name_diff);
  })


  channel_list.forEach((channel) => {
    const sep_sequence = data.sequence.components.find((element) => { return typeof element === 'object' && element.id === "Discriminability" }) as ComponentBlock
    const channel_component = sep_sequence.components.find((element) => { return typeof element === 'object' && element.id === channel }) as ComponentBlock
    // const channel_component = sep_sequence.components.find((element) => { return typeof element === 'object' && element.id === 'Overall' }) as ComponentBlock

    for (let i = 0; i < disc_study_times; i++) {

      const disc_study_name = disc_study_times === 1 ? `${channel}-discriminability` : `${channel}-disc-${i}`
      data.components[disc_study_name] = {
        "type": "react-component",
        "path": "Graphical-Perception/assets/Discriminability/Study.tsx",
        "parameters": {
          "taskid": disc_study_name,
          "test": false,
          [disc_study_name]: channel === 'curvature' || channel === 'tilt' ? "disc(180)" : "disc(100)",
        },
        "instruction": "Are the two element **different** in terms of **" + channel + "** ?",
        "response": [
          {
            "id": disc_study_name,
            "prompt": "",
            "required": true,
            "type": "radio",
            "location": "sidebar",
            "options": [{ "label": "Same " + channel, "value": "Same" }, { "label": "Different " + channel, "value": "Different" }],
          }
        ],
        "nextButtonLocation": "sidebar",
        "nextButtonText": "Next or Press Enter"
      }
      channel_component.components.push(disc_study_name);
    }
  })

  // Popout Study
  const popout_sequence = data.sequence.components.find((element) => { return typeof element === 'object' && element.id === "Popout" }) as ComponentBlock
  for (let i in popout_sequence.components) {
    if (typeof popout_sequence.components[i] !== 'object') continue;
    const component_block = popout_sequence.components[i] as ComponentBlock

    const components_copy = [...component_block.components]
    component_block.components = []
    for (let component_name of components_copy) {
      if (typeof component_name !== 'string') continue;
      const component = data.components[component_name] as ReactComponent
      delete data.components[component_name]
      for (let j = 0; j < popout_study_times; j++) {
        const new_component_name = popout_study_times === 1 ? component_name : `${component_name}-${j}`
        data.components[new_component_name] = JSON.parse(JSON.stringify(component))
        component_block.components.push(new_component_name)
      }
    }

  }



  Object.keys(data.components).forEach((key: string) => {
    const component = data.components[key];
    if (component.type === 'react-component' && typeof component.parameters === 'object' && component.parameters !== undefined) {

      for (const paramKey in component.parameters) {

        let paramValue = component.parameters[paramKey];
        // 1. 단일 random(x, y) 처리
        if (typeof paramValue === 'string' && /^random\(\d+,\s*\d+\)$/.test(paramValue)) {
          component.parameters[paramKey] = generateRandomFromPattern(paramValue, rng);
          updateCorrectAnswer(component, paramKey, component.parameters[paramKey]);
        }

        //2. "disc(number)" 처리
        else if (typeof paramValue === 'string' && /^disc\(\d+\)$/.test(paramValue)) {
          const randomMatch = paramValue.match(/\d+/g);
          const leftRandomNum = randomMatch
            ? Math.floor(rng() * (parseInt(randomMatch[0]) + 1))
            : Math.round(rng() * 100);
          // make rightRandomNum - (30% of leftRandomNum + 5) ~ (30% of leftRandomNum + 5) of leftRandomNum

          const minVal = Math.max(0, leftRandomNum - (leftRandomNum) * 0.1 - 5);
          const maxVal = Math.min(randomMatch ? parseInt(randomMatch[0]) : leftRandomNum, leftRandomNum + (leftRandomNum) * 0.1 + 5);

          const rightRandomNum = Math.floor(minVal + rng() * (maxVal - minVal));

          // const [leftRandomNum, rightRandomNum] = [5, randomMatch ? parseInt(randomMatch[0]) - 20 : 50] // TEST
          component.parameters[paramKey] = [leftRandomNum, rightRandomNum];
          updateCorrectAnswer(component, key, component.parameters[paramKey]);
        }

        // // 2. 배열 형태의 random(x, y) 처리
        // else if (typeof paramValue === 'string' && paramValue.trim().startsWith('[') && paramValue.trim().endsWith(']')) {
        //   const extractedValues = extractAndReplaceRandomValues(paramValue, rng);
        //   component.parameters[paramKey] = extractedValues;
        //   updateCorrectAnswer(component, paramKey, extractedValues);
        // }

        // 3. random(boolean) 처리
        else if (typeof paramValue === 'string' && paramValue === 'random(boolean)') {
          const randomBool = rng() < 0.5;
          // const randomBool = true // TEST
          component.parameters[paramKey] = randomBool;
          updateCorrectAnswer(component, paramKey, randomBool);
        }

        // 4. 기본 time_limit 처리
        else if (paramKey === 'time_limit' && typeof paramValue === 'string' && paramValue === 'default') {
          component.parameters[paramKey] = DEFAULT_TIME_LIMIT;
        }
        else {
        }
      }
    }
  });

  return data;
}

// 개별 random(x, y) 값 생성 함수
function generateRandomFromPattern(pattern: string, rng: () => number): number {
  const randomMatch = pattern.match(/\d+/g);
  return randomMatch
    ? Math.floor(rng() * (parseInt(randomMatch[1]) - parseInt(randomMatch[0])) + parseInt(randomMatch[0]))
    : Math.round(rng() * 100);
  // return randomMatch ? parseInt(randomMatch[1]) - 20 : 0; //TEST
}

// 문자열로 주어진 배열에서 random(x, y) 변환
function extractAndReplaceRandomValues(input: string, rng: () => number): number[] {
  try {
    const transformedInput = input.replace(/random\(\d+,\s*\d+\)/g, (match) => {
      return generateRandomFromPattern(match, rng).toString();
    });

    // JSON.parse()를 이용하여 실제 배열로 변환
    return JSON.parse(transformedInput);
  } catch (error) {
    console.error("Failed to parse random array:", input, error);
    return [];
  }
}

// 정답 데이터 업데이트 함수
function updateCorrectAnswer(component: ReactComponent | (Partial<ReactComponent> & { baseComponent: string; }), key: string, value: any) {
  if (!component.correctAnswer) {
    component.correctAnswer = [];
  }

  const existingAnswer = component.correctAnswer.find((answer) => answer.id === key);
  if (existingAnswer) {
    existingAnswer.answer = value;
  } else {
    component.correctAnswer.push({
      id: key,
      answer: value,
    });
  }
}

function generateHash(input: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  return crypto.subtle.digest('SHA-256', data).then(hashBuffer => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  });
}
