// Topology fragment shader
uniform vec4 uBeatWeights;
uniform vec3 uColorBioStrand1;
uniform vec3 uColorBioStrand2;
uniform vec3 uColorBioRung;
uniform vec3 uColorLatticeSlate;
uniform vec3 uColorLatticeCyan;
uniform vec3 uColorLatticeGreen;
uniform vec3 uColorPlaneObsidian;
uniform vec3 uColorPlaneSilver;
uniform vec3 uColorPlaneMoonlight;
uniform float uTime;

varying float vDepth;
varying float vProgressIndex;
varying float vHelixSide;
varying float vRungMix;
varying float vWorldY;

void main() {
  // Soft circular point
  vec2 uv = gl_PointCoord - 0.5;
  float dist = length(uv);
  if (dist > 0.5) discard;
  float alpha = smoothstep(0.5, 0.1, dist);

  // Beat 1: Bio — distinct strands and bright rungs
  // Use step instead of smoothstep for absolute separation of strands
  float side = step(0.5, vHelixSide);
  vec3 strandColor = mix(uColorBioStrand1, uColorBioStrand2, side);
  
  // Harder mask for rungs so they don't bleed into strands
  // aRungMix ranges from 0 to 0.4. We want the highest values to be rungs.
  float isRung = step(0.35, vRungMix);
  vec3 bioColor = mix(strandColor, uColorBioRung, isRung);
  
  // Reduce overall brightness significantly to prevent additive blowout
  // The dense helix adds up very quickly
  bioColor *= mix(0.3, 0.05, vDepth);

  // Beat 2: Lattice — dark slate / cyan-green streams with downward worldY-based pulses
  // Make the pulse wider and more visible
  float pulsePhase = fract(vWorldY * 0.2 + uTime * 1.5);
  // Sharp pulse to stand out against the dark background
  float pulse = smoothstep(0.7, 0.9, pulsePhase) * smoothstep(1.0, 0.9, pulsePhase);
  
  // Base color is pure black, pulse adds bright cyan/green
  vec3 latticeBase = uColorLatticeSlate;
  vec3 pulseColor = mix(uColorLatticeCyan, uColorLatticeGreen, vDepth);
  // Boost pulse intensity significantly so it reads clearly
  vec3 latticeColor = latticeBase + pulseColor * pulse * 3.0;

  // Beat 3: Chaos — white/prismatic
  vec3 chaosColor = vec3(0.4, 0.35, 0.3);

  // Beat 4: Plane — obsidian mirror with faint pale-silver / moonlight-blue glimmers on ripple peaks
  // vWorldY ranges from -0.02 to 0.02. Isolate just the very highest peaks.
  float ripplePeak = smoothstep(0.01, 0.02, vWorldY);
  vec3 glimmerColor = mix(uColorPlaneSilver, uColorPlaneMoonlight, vDepth);
  
  // Base is pure black, only add glimmer on peaks
  vec3 planeColor = mix(uColorPlaneObsidian, glimmerColor, ripplePeak);

  vec3 finalColor = bioColor   * uBeatWeights.x
                  + latticeColor * uBeatWeights.y
                  + chaosColor   * uBeatWeights.z
                  + planeColor   * uBeatWeights.w;

  // Adjust alpha to prevent blowout
  // Beat 1 & 2 need enough alpha to be visible but not blow out
  float baseAlpha = alpha * (0.04 + vDepth * 0.02);
  
  // Beat 4 needs extremely low alpha because of the dense particle grid (500k particles)
  // Even a tiny alpha will add up to bright white if we're not careful
  float planeAlpha = alpha * (0.05 + vDepth * 0.05);
  
  float finalAlpha = mix(baseAlpha, planeAlpha, uBeatWeights.w);
  
  gl_FragColor = vec4(finalColor, finalAlpha);
}
