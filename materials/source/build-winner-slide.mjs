import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';
const modules=process.env.RUNTIME_NODE_MODULES;if(!modules)throw Error('Set RUNTIME_NODE_MODULES to the bundled runtime');
const {Presentation,PresentationFile}=await import(pathToFileURL(path.join(modules,'@oai/artifact-tool/dist/artifact_tool.mjs')).href);
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),root=path.resolve(repo,'../..'),build=path.join(root,'work/winner-slide'),out=path.join(repo,'materials');
const skill='C:/Users/user/.codex/plugins/cache/openai-primary-runtime/presentations/26.1009.11318/skills/presentations';
await fs.mkdir(build,{recursive:true});
const pres=Presentation.create({slideSize:{width:1280,height:720}}),slide=pres.slides.add();slide.background.fill='#050B19';
const img=await fs.readFile(path.join(out,'assets/award-background-v1.png'));
slide.images.add({blob:img.buffer.slice(img.byteOffset,img.byteOffset+img.byteLength),contentType:'image/png',alt:'金色の照明と紙吹雪が縁を囲む架空の授賞式ステージ',fit:'cover',position:{left:0,top:0,width:1280,height:720}});
function text(name,value,x,y,w,h,size,color,bold){const s=slide.shapes.add({geometry:'textbox',name,position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});s.text=value;s.text.style={typeface:'Noto Sans JP',fontSize:size,bold,color,alignment:'center',verticalAlignment:'middle'};}
text('award','レコード大賞',130,130,1020,62,42,'#F9DB91',true);
text('winner-name','優勝グループ名',110,238,1060,250,108,'#FFFFFF',true);
text('final-fans','獲得ファン数を入力',150,502,980,50,30,'#EEE5CC',false);
text('debut','メジャーデビュー決定',130,580,1020,66,44,'#F9DB91',true);
slide.speakerNotes.text='これは当日差し替え用の1枚テンプレート。司会の発表前に、確定した優勝グループ名と獲得ファン数へ書き換えてから投影する。共同受賞なら全グループ名を記載し、「レコード大賞　共同受賞」「共同メジャーデビュー決定」に変更する。長い名前は意味の切れ目で2行にする。\nデザイン背景はAIで生成した架空のステージ。実際の会場写真ではない。\n設計参考：https://github.com/carnot-tech/consulting-pptx-skill/blob/main/references/slide-rules.md';
const candidate=path.join(build,'candidate.pptx');await(await PresentationFile.exportPptx(pres)).save(candidate);
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:path.join(out,'winner-announcement-template-v1.pptx'),pythonExecutable:'C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],explicitTotalSlideCount:1,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],fontPolicy:{basis:'design',families:['Noto Sans JP']},verifyArtifactToolImport:true,receiptPath:path.join(build,'validation.json')});
console.log('Winner slide template finalized');
