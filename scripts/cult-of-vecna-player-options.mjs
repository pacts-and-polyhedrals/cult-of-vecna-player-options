/**
 * The Ninth School — Foundry VTT Module v1.1.0
 * School of Orthogenesis, Whispered Agony Cleric, Forbidden Secrets Paladin
 * Created by DM Asmo / Pacts and Polyhedrals
 */

const MODULE_ID    = "cult-of-vecna-player-options";
const MODULE_TITLE = "Cult of Vecna — Player Options";
const INSTALL_FLAG_KEY = "contentInstalled_v100"; // version-stamped so it resets on new versions

Hooks.once("init", () => {
  console.log(`${MODULE_TITLE} | v1.0.0 init`);
  game.settings.register(MODULE_ID, INSTALL_FLAG_KEY, {
    name:    "Content Installed v1.1.0",
    scope:   "world",
    config:  false,
    type:    Boolean,
    default: false,
  });
});

Hooks.once("ready", () => {
  if (!game.user?.isGM) return;

  let done = false;
  try { done = game.settings.get(MODULE_ID, INSTALL_FLAG_KEY); }
  catch(e) { console.warn(`${MODULE_TITLE} | setting read failed, treating as first run`); }
  if (done) return;

  setTimeout(showInstallDialog, 2500);
});

function showInstallDialog() {
  new Dialog({
    title: `${MODULE_TITLE} — First-Time Setup`,
    content: `
      <div style="font-family:Georgia,serif;padding:1rem 0.5rem;">
        <p style="font-size:15px;color:#c9922a;font-style:italic;text-align:center;margin:0 0 0.75rem;">
          "Nature is not sacred. Nature is unfinished.<br>
           Druids preserve the error. Wizards correct it."
        </p>
        <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#6b4a1a;text-align:center;margin:0 0 1rem;">
          — Diane Clearwater, Orthogenist Lich
        </p>
        <hr style="border-color:#3a2810;margin:0 0 1rem;"/>
        <p style="margin:0 0 0.5rem;"><strong>The Ninth School</strong> can install all compendium content into named world folders:</p>
        <ul style="margin:0.5rem 0 0.75rem 1.25rem;color:#8b6530;font-style:italic;line-height:2;">
          <li>The Ninth School — Actors <span style="color:#6b5020;">(8 NPC actors, CR ½–21)</span></li>
          <li>The Ninth School — Spells <span style="color:#6b5020;">(44 spells)</span></li>
          <li>The Ninth School — Features <span style="color:#6b5020;">(24 subclass features)</span></li>
          <li>The Ninth School — Lore <span style="color:#6b5020;">(4 journals)</span></li>
        </ul>
        <p style="margin:0;font-size:11px;color:#6b5020;">This prompt will not appear again after you choose.</p>
      </div>`,
    buttons: {
      install: {
        icon:  '<i class="fas fa-seedling"></i>',
        label: "Yes — Install Content",
        callback: async () => {
          await game.settings.set(MODULE_ID, INSTALL_FLAG_KEY, true);
          await installContent();
        }
      },
      skip: {
        icon:  '<i class="fas fa-times"></i>',
        label: "No — Use Compendiums Manually",
        callback: async () => {
          await game.settings.set(MODULE_ID, INSTALL_FLAG_KEY, true);
          ui.notifications?.info(`${MODULE_TITLE}: Use the Compendiums tab to access content directly.`);
        }
      }
    },
    default: "install",
  }, { width: 480 }).render(true);
}

async function installContent() {
  const FOLDERS = [
    { name: "The Ninth School — Actors",   type: "Actor",        color: "#3a1f0a" },
    { name: "The Ninth School — Spells",   type: "Item",         color: "#1a0a2e" },
    { name: "The Ninth School — Features", type: "Item",         color: "#0a1a0a" },
    { name: "The Ninth School — Lore",     type: "JournalEntry", color: "#1a1010" },
  ];

  const PACK_MAP = {
    "actors":                  { folder: "The Ninth School — Actors",   collKey: "actors"  },
    "spells":                  { folder: "The Ninth School — Spells",   collKey: "items"   },
    "subclasses-and-features": { folder: "The Ninth School — Features", collKey: "items"   },
    "lore":                    { folder: "The Ninth School — Lore",     collKey: "journal" },
  };

  ui.notifications?.info(`${MODULE_TITLE}: Installing content — please wait...`);

  const folderIds = {};
  for (const fd of FOLDERS) {
    const existing = game.folders.find(f => f.name === fd.name && f.type === fd.type);
    if (existing) {
      folderIds[fd.name] = existing.id;
    } else {
      const created = await Folder.create({ name: fd.name, type: fd.type, color: fd.color });
      folderIds[fd.name] = created?.id ?? null;
    }
  }

  let total = 0;
  for (const [packName, { folder, collKey }] of Object.entries(PACK_MAP)) {
    const pack = game.packs.get(`${MODULE_ID}.${packName}`);
    if (!pack) { console.warn(`${MODULE_TITLE} | Pack not found: ${packName}`); continue; }
    const docs = await pack.getDocuments();
    const fid  = folderIds[folder];
    for (const doc of docs) {
      const data  = doc.toObject();
      data.folder = fid;
      const coll  = game[collKey];
      if (!coll?.find(d => d.name === data.name)) {
        await doc.constructor.create(data);
        total++;
      }
    }
  }
  ui.notifications?.info(`${MODULE_TITLE}: Done — ${total} documents added to named folders.`);
}

// ── Arcana 17+ → whisper doctrine to GM ──────────────────────────────────────
Hooks.on("dnd5e.rollSkill", (actor, roll, skillId) => {
  if (skillId !== "arc") return;
  if ((roll?.total ?? 0) < 17) return;
  ChatMessage.create({
    speaker: { alias: "The Manuscript Trembles" },
    content: `<div style="border-left:3px solid #6b4a1a;padding:0.5rem 0.875rem;">
      <p><strong>Arcana DC 17 — the hidden doctrine surfaces:</strong></p>
      <ol style="color:#c9922a;font-style:italic;line-height:2;margin:0.5rem 0 0.5rem 1.25rem;">
        <li>Contain the root.</li><li>Bring the alien seed.</li>
        <li>Read the hidden pattern.</li><li>Command the instinct.</li>
        <li>Burn the old growth.</li><li>Dream the better form.</li>
        <li>Feed life with death.</li><li>Fix the chosen shape.</li>
      </ol>
      <p style="color:#6b4a1a;font-style:italic;margin:0;">Nature is not sacred. Nature is unfinished. Druids preserve the error. Wizards correct it.</p>
    </div>`,
    whisper: ChatMessage.getWhisperRecipients("GM"),
  });
});

// ── Orthogenic Mark toggle ────────────────────────────────────────────────────
Hooks.on("getActorSheetHeaderButtons", (sheet, buttons) => {
  if (!game.user?.isGM) return;
  const actor = sheet?.actor;
  if (!actor) return;
  buttons.unshift({
    label: "Orthogenic Mark",
    class: "ninth-school-mark-btn",
    icon:  "fas fa-seedling",
    onclick: async () => {
      const existing = actor.effects.find(e => e.getFlag(MODULE_ID, "orthogenicMark"));
      if (existing) {
        await existing.delete();
        ui.notifications?.info(`Orthogenic Mark removed from ${actor.name}.`);
      } else {
        await actor.createEmbeddedDocuments("ActiveEffect", [{
          name:     "Orthogenic Mark",
          icon:     `modules/${MODULE_ID}/assets/artwork/spell-icons/root-sight.png`,
          origin:   MODULE_ID, disabled: false,
          flags:    { [MODULE_ID]: { orthogenicMark: true } },
          changes:  [],
        }]);
        ui.notifications?.info(`Orthogenic Mark applied to ${actor.name}. Beasts and plants avoid them for 1d10 days.`);
      }
    },
  });
});
