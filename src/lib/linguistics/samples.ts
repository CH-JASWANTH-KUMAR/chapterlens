export interface SamplePassage {
  id: string;
  title: string;
  genre: string;
  description: string;
  text: string;
}

export const SAMPLE_PASSAGES: SamplePassage[] = [
  {
    id: 'clockmakers-apprentice',
    title: "The Clockmaker's Apprentice",
    genre: 'Literary Fiction',
    description: 'A balance of sensory description, dialogue, and elaborate 19th-century mechanical exposition.',
    text: `The rain had slackened by dusk, leaving the cobblestones of Bell Tower Lane slick as polished obsidian. Inside the workshop of Master Vane, three dozen brass escapements clicked in asynchronous, unsettling rebellion against the quiet evening.

"Hold the loupe steady, Elian," the old man murmured without lifting his gaze from the balance wheel. "A single tremor of the wrist will shear the pinion teeth, and three months of lathe work will dissolve into scrap."

Elian gripped the cedar handle of the magnifier until his knuckles turned chalky white. Although he had spent four arduous winters memorizing the intricate kinematics of celestial chronometers (calculating gear ratios by tallow candlelight and filing infinitesimal escapement pallets until his fingertips bled), his pulse still quickened whenever the master approached the delicate hairspring. The mechanism, originally commissioned by the Arch-Chancellor of the Northern Marches, contained seventeen jeweled bearings carved from uncut Ceylon sapphires.

"Is the tension calibrated?" Elian asked.

"Hardly," Master Vane replied, setting aside his tweezers with deliberate slowness. "A clockwork heart does not forgive impatience, boy. It measures mortal hours with indifferent geometry."

The furnace embers flared briefly, casting distorted silhouettes against the damp plaster walls. In that momentary glow, Elian noticed a hair-thin fracture running along the escapement arbor; an imperceptible flaw that would inevitably cause the entire assembly to seize when wound to maximum torque.`,
  },
  {
    id: 'orbital-survey',
    title: 'Orbital Reconnaissance Log',
    genre: 'Speculative Sci-Fi / Technical Prose',
    description: 'High syntactic complexity, specialized nomenclature, and dense polysyllabic construction.',
    text: `Preliminary spectroscopic reconnaissance of the equatorial caldera indicates anomalous subterranean electromagnetic fluctuations. The expeditionary team postulated that subterranean geothermal conduits, heavily saturated with piezoelectric silicates, might be generating localized magnetohydrodynamic turbulence.

Consequently, the autonomous surveying apparatus experienced intermittent telemetry attenuation whenever orbital periapsis coincided with tectonic subduction zones. Senior specialist Dr. Aris Thorne recommended immediate recalibration of the ultra-high-frequency transceivers; otherwise, subterranean navigational telemetry would remain fundamentally compromised throughout the descending atmospheric trajectory.

"Telemetry variance exceeds acceptable margins," reported the navigation synthetic.

Despite these precarious atmospheric disturbances, the secondary auxiliary sensors continued recording baseline atmospheric barometric pressures across all longitudinal sectors.`,
  },
  {
    id: 'river-crossing',
    title: 'The River Crossing',
    genre: 'Adventure / Thriller',
    description: 'Punchy, conversational prose with short declarative sentences and rapid cadence.',
    text: `The rope bridge swayed violently in the crosswind. Below, the gorge roared like an angry beast.

Marcus stepped forward. The wooden planks groaned beneath his boots. He did not look down. Looking down had cost his brother his life three summers ago.

"Hurry!" Elena whispered from the far bank.

He reached the midpoint. A gust slammed against the fraying cables. He froze. Every muscle in his shoulders locked tight. Then he took another step, steady and quiet, until his hand caught the iron anchor post.`,
  },
];
