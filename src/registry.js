/* ============================================================
   registry.js —— 效果注册表
   加效果：文件放进 src/effects/ → 加一行 import + 塞进 EFFECTS
   ============================================================ */
import { GROUP_MAP } from './groups.js';

/* ---- 入场与转场 (42) ---- */
import entranceAgentChatDemo from './effects/entrance.agent-chat-demo.js';
import entranceBentoLightup from './effects/entrance.bento-lightup.js';
import entranceBlindsFlip from './effects/entrance.blinds-flip.js';
import entranceDrawPath from './effects/entrance.draw-path.js';
import entranceEaseShelf from './effects/entrance.ease-shelf.js';
import entranceGlTransition from './effects/entrance.gl-transition.js';
import entranceGradientHeading from './effects/entrance.gradient-heading.js';
import entranceGradientWordSweep from './effects/entrance.gradient-word-sweep.js';
import entranceGridStagger from './effects/entrance.grid-stagger.js';
import entranceHeightMorph from './effects/entrance.height-morph.js';
import entranceInkBleedReveal from './effects/entrance.ink-bleed-reveal.js';
import entranceLightBoard from './effects/entrance.light-board.js';
import entranceCornerSpotlight from './effects/entrance.corner-spotlight.js';
import entranceLetterDrop from './effects/entrance.letter-drop.js';
import entranceListReveal from './effects/entrance.list-reveal.js';
import entranceMarkerUnderline from './effects/entrance.marker-underline.js';
import entranceMaskShapeCycles from './effects/entrance.mask-shape-cycles.js';
import entranceNeonFrame from './effects/entrance.neon-frame.js';
import entranceOutlineFill from './effects/entrance.outline-fill.js';
import entrancePillSlotCycle from './effects/entrance.pill-slot-cycle.js';
import entrancePixelHeading from './effects/entrance.pixel-heading.js';
import entrancePopupRise from './effects/entrance.popup-rise.js';
import entranceRsTransitionList from './effects/entrance.rs-transition-list.js';
import entranceSpringEnter from './effects/entrance.spring-enter.js';
import entranceSpringModal from './effects/entrance.spring-modal.js';
import entranceStaggerIn from './effects/entrance.stagger-in.js';
import entranceTextScramble from './effects/entrance.text-scramble.js';
import entranceTrBlurFade from './effects/entrance.tr-blur-fade.js';
import entranceTrBurn from './effects/entrance.tr-burn.js';
import entranceTrCrossWarp from './effects/entrance.tr-cross-warp.js';
import entranceTrDisplaceWarp from './effects/entrance.tr-displace-warp.js';
import entranceTrEdgeGlow from './effects/entrance.tr-edge-glow.js';
import entranceTrGlitch from './effects/entrance.tr-glitch.js';
import entranceTrMosaic from './effects/entrance.tr-mosaic.js';
import entranceTrNoiseDissolve from './effects/entrance.tr-noise-dissolve.js';
import entranceTrPixelize from './effects/entrance.tr-pixelize.js';
import entranceTrRipple from './effects/entrance.tr-ripple.js';
import entranceTrSwirl from './effects/entrance.tr-swirl.js';
import entranceTrWaterdrop from './effects/entrance.tr-waterdrop.js';
import entranceTypewriterCaret from './effects/entrance.typewriter-caret.js';
import entranceWeightPump from './effects/entrance.weight-pump.js';
import entranceWipeReveal from './effects/entrance.wipe-reveal.js';

/* ---- 交互反馈 (31) ---- */
import feedbackAnimeMorph from './effects/feedback.anime-morph.js';
import feedbackBgAnimateBtn from './effects/feedback.bg-animate-btn.js';
import feedbackButtonMorph from './effects/feedback.button-morph.js';
import feedbackContactShadow from './effects/feedback.contact-shadow.js';
import feedbackCosmicBtn from './effects/feedback.cosmic-btn.js';
import feedbackCursorFollow from './effects/feedback.cursor-follow.js';
import feedbackDirectionTabs from './effects/feedback.direction-tabs.js';
import feedbackDisclosureSummary from './effects/feedback.disclosure-summary.js';
import feedbackDockMagnify from './effects/feedback.dock-magnify.js';
import feedbackGridReflow from './effects/feedback.grid-reflow.js';
import feedbackIntentFill from './effects/feedback.intent-fill.js';
import feedbackIslandMorph from './effects/feedback.island-morph.js';
import feedbackIsoParametric from './effects/feedback.iso-parametric.js';
import feedbackKnobGesture from './effects/feedback.knob-gesture.js';
import feedbackMagneticBtn from './effects/feedback.magnetic-btn.js';
import feedbackNeumorphBtn from './effects/feedback.neumorph-btn.js';
import feedbackP5LerpEase from './effects/feedback.p5-lerp-ease.js';
import feedbackProMaterial from './effects/feedback.pro-material.js';
import feedbackReleaseNoFlash from './effects/feedback.release-no-flash.js';
import feedbackRipple from './effects/feedback.ripple.js';
import feedbackScrubNumber from './effects/feedback.scrub-number.js';
import feedbackSegmentedThumb from './effects/feedback.segmented-thumb.js';
import feedbackRsDecayScroll from './effects/feedback.rs-decay-scroll.js';
import feedbackRsSpringPresets from './effects/feedback.rs-spring-presets.js';
import feedbackRsTrailChain from './effects/feedback.rs-trail-chain.js';
import feedbackShiftCard from './effects/feedback.shift-card.js';
import feedbackSliderInset from './effects/feedback.slider-inset.js';
import feedbackSpringCard from './effects/feedback.spring-card.js';
import feedbackTabInk from './effects/feedback.tab-ink.js';
import feedbackTextureBtn from './effects/feedback.texture-btn.js';
import feedbackTilt3d from './effects/feedback.tilt-3d.js';
import feedbackTriggerWidest from './effects/feedback.trigger-widest.js';

/* ---- 空间与 3D (16) ---- */
import spaceCardStack from './effects/space.card-stack.js';
import spaceCarouselStep from './effects/space.carousel-step.js';
import spaceCss3dCardRing from './effects/space.css3d-card-ring.js';
import spaceCutoutCard from './effects/space.cutout-card.js';
import spaceDepthEcho from './effects/space.depth-echo.js';
import spaceFlipResize from './effects/space.flip-resize.js';
import spaceFoldCard from './effects/space.fold-card.js';
import spaceGlInstancedGrid from './effects/space.gl-instanced-grid.js';
import spaceGlRaycastHover from './effects/space.gl-raycast-hover.js';
import spaceGlRotatingBox from './effects/space.gl-rotating-box.js';
import spaceGlWaveSurface from './effects/space.gl-wave-surface.js';
import spaceMinimalCard from './effects/space.minimal-card.js';
import spaceP5StackSpace from './effects/space.p5-stack-space.js';
import spaceParallaxDepth from './effects/space.parallax-depth.js';
import spacePathArcLength from './effects/space.path-arc-length.js';
import spaceThreeCube from './effects/space.three-cube.js';

/* ---- 粒子与氛围 (20) ---- */
import particleAurora from './effects/particle.aurora.js';
import particleBorderBeam from './effects/particle.border-beam.js';
import particleCrtTape from './effects/particle.crt-tape.js';
import particleDitherImage from './effects/particle.dither-image.js';
import particleDofBlur from './effects/particle.dof-blur.js';
import particleEdgeBlur from './effects/particle.edge-blur.js';
import particleFlutedGlass from './effects/particle.fluted-glass.js';
import particleGlParticleVortex from './effects/particle.gl-particle-vortex.js';
import particleGlParticlesCloud from './effects/particle.gl-particles-cloud.js';
import particleGlowOrb from './effects/particle.glow-orb.js';
import particleGradientFlow from './effects/particle.gradient-flow.js';
import particleGravityField from './effects/particle.gravity-field.js';
import particleInstancedDots from './effects/particle.instanced-dots.js';
import particleP5GaussBurst from './effects/particle.p5-gauss-burst.js';
import particleP5NoiseDrift from './effects/particle.p5-noise-drift.js';
import particleParticles from './effects/particle.particles.js';
import particleRadialWave from './effects/particle.radial-wave.js';
import particleStripeGuides from './effects/particle.stripe-guides.js';
import particleTextureOverlay from './effects/particle.texture-overlay.js';
import particleWatercolorWash from './effects/particle.watercolor-wash.js';

/* ---- 物理与拟真 (12) ---- */
import physicsElasticDrag from './effects/physics.elastic-drag.js';
import physicsFkWave from './effects/physics.fk-wave.js';
import physicsGravityDrop from './effects/physics.gravity-drop.js';
import physicsMatterCompoundBody from './effects/physics.matter-compound-body.js';
import physicsMatterSpringChain from './effects/physics.matter-spring-chain.js';
import physicsMorphBlob from './effects/physics.morph-blob.js';
import physicsRapierCcdBullet from './effects/physics.rapier-ccd-bullet.js';
import physicsRapierMotorJoint from './effects/physics.rapier-motor-joint.js';
import physicsRapierRagdoll2d from './effects/physics.rapier-ragdoll-2d.js';
import physicsRapierRopeChain from './effects/physics.rapier-rope-chain.js';
import physicsRapierStackCollapse from './effects/physics.rapier-stack-collapse.js';
import physicsRsChainOrch from './effects/physics.rs-chain-orch.js';

/* ---- 数据动效 (19) ---- */
import dataAgentStack from './effects/data.agent-stack.js';
import dataBeforeAfterSlider from './effects/data.before-after-slider.js';
import dataBarGrow from './effects/data.bar-grow.js';
import dataCountUp from './effects/data.count-up.js';
import dataDonutRing from './effects/data.donut-ring.js';
import dataGltQuantizeLod from './effects/data.glt-quantize-lod.js';
import dataKaraokeFill from './effects/data.karaoke-fill.js';
import dataNeedleGauge from './effects/data.needle-gauge.js';
import dataP5DprSharp from './effects/data.p5-dpr-sharp.js';
import dataP5NoiselineStack from './effects/data.p5-noiseline-stack.js';
import dataRollingNumber from './effects/data.rolling-number.js';
import dataScrollScrub from './effects/data.scroll-scrub.js';
import dataSkeletonShimmer from './effects/data.skeleton-shimmer.js';
import dataSparkline from './effects/data.sparkline.js';
import dataThinkingDots from './effects/data.thinking-dots.js';
import dataTimelineOrch from './effects/data.timeline-orch.js';
import dataTimelineTracks from './effects/data.timeline-tracks.js';
import dataWordCaptions from './effects/data.word-captions.js';
import dataWordReel from './effects/data.word-reel.js';

/* ---- 声音驱动 (3) ---- */
import audioSpectrumBars from './effects/audio.spectrum-bars.js';
import audioToneClick from './effects/audio.tone-click.js';
import audioWaveform from './effects/audio.waveform.js';

export const EFFECTS = [
  // 入场与转场
  entranceAgentChatDemo,
  entranceBentoLightup, entranceBlindsFlip, entranceDrawPath, entranceEaseShelf, entranceGlTransition,
  entranceGradientHeading, entranceGradientWordSweep, entranceGridStagger, entranceHeightMorph,
  entranceInkBleedReveal, entranceLetterDrop, entranceLightBoard,
  entranceCornerSpotlight, entranceListReveal, entranceMarkerUnderline, entranceMaskShapeCycles, entranceNeonFrame,
  entranceOutlineFill,
  entrancePillSlotCycle, entrancePixelHeading,
  entrancePopupRise, entranceRsTransitionList, entranceSpringEnter, entranceSpringModal,
  entranceStaggerIn, entranceTextScramble, entranceTrBlurFade, entranceTrBurn,
  entranceTrCrossWarp, entranceTrDisplaceWarp, entranceTrEdgeGlow, entranceTrGlitch,
  entranceTrMosaic, entranceTrNoiseDissolve, entranceTrPixelize, entranceTrRipple,
  entranceTrSwirl, entranceTrWaterdrop, entranceTypewriterCaret, entranceWeightPump, entranceWipeReveal,
  // 交互反馈
  feedbackAnimeMorph, feedbackBgAnimateBtn, feedbackButtonMorph, feedbackContactShadow, feedbackCosmicBtn,
  feedbackCursorFollow, feedbackDirectionTabs, feedbackDisclosureSummary, feedbackDockMagnify, feedbackGridReflow,
  feedbackIntentFill, feedbackIslandMorph, feedbackIsoParametric, feedbackKnobGesture, feedbackMagneticBtn, feedbackNeumorphBtn,
  feedbackP5LerpEase, feedbackProMaterial, feedbackReleaseNoFlash, feedbackRipple, feedbackRsDecayScroll,
  feedbackRsSpringPresets, feedbackRsTrailChain, feedbackScrubNumber, feedbackSegmentedThumb, feedbackShiftCard,
  feedbackSliderInset, feedbackSpringCard, feedbackTabInk, feedbackTextureBtn, feedbackTilt3d, feedbackTriggerWidest,
  // 空间与 3D
  spaceCardStack, spaceCarouselStep, spaceCss3dCardRing, spaceCutoutCard, spaceDepthEcho, spaceFlipResize, spaceFoldCard,
  spaceGlInstancedGrid, spaceGlRaycastHover, spaceGlRotatingBox, spaceGlWaveSurface,
  spaceMinimalCard, spaceP5StackSpace, spaceParallaxDepth, spacePathArcLength, spaceThreeCube,
  // 粒子与氛围
  particleAurora, particleBorderBeam, particleCrtTape, particleDitherImage, particleDofBlur, particleEdgeBlur,
  particleFlutedGlass, particleGlParticleVortex, particleGlParticlesCloud, particleGlowOrb,
  particleGradientFlow, particleGravityField, particleInstancedDots, particleP5GaussBurst,
  particleP5NoiseDrift, particleParticles, particleRadialWave, particleStripeGuides, particleTextureOverlay,
  particleWatercolorWash,
  // 物理与拟真
  physicsElasticDrag, physicsFkWave, physicsGravityDrop, physicsMatterCompoundBody,
  physicsMatterSpringChain, physicsMorphBlob, physicsRapierCcdBullet,
  physicsRapierMotorJoint, physicsRapierRagdoll2d, physicsRapierRopeChain,
  physicsRapierStackCollapse, physicsRsChainOrch,
  // 数据动效
  dataAgentStack, dataBarGrow, dataBeforeAfterSlider, dataCountUp, dataDonutRing, dataGltQuantizeLod,
  dataKaraokeFill, dataNeedleGauge, dataP5DprSharp, dataP5NoiselineStack, dataRollingNumber, dataScrollScrub,
  dataSkeletonShimmer, dataSparkline, dataThinkingDots, dataTimelineOrch, dataTimelineTracks,
  dataWordCaptions, dataWordReel,
  // 声音驱动
  audioSpectrumBars, audioToneClick, audioWaveform,
];

/* 加载即校验：id 重复 / 分组不存在 / 缺 init 直接抛错 */
const seen = new Set();
for (const fx of EFFECTS) {
  if (seen.has(fx.id)) throw new Error('[registry] id 重复: ' + fx.id);
  seen.add(fx.id);
  if (!GROUP_MAP[fx.group]) throw new Error('[registry] 未知分组: ' + fx.id);
  if (typeof fx.init !== 'function') throw new Error('[registry] 缺少 init(): ' + fx.id);
}
