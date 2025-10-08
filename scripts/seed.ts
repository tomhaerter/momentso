import { competences, organisations } from "~~/server/database/schema"
import { useDrizzle } from "~~/server/utils/drizzle"
import { nanoid } from "nanoid"
import { eq } from "drizzle-orm"

async function importCompetencesRecursively() {
  const db = useDrizzle()

  // 1) fetch your organisation
  const [organisation] = await db.select().from(organisations).limit(1)
  if (!organisation) throw new Error("No organisation found")

  // 2) Clean up existing competences
  console.log("Deleting all existing competences...")
  await db.delete(competences).where(eq(competences.organisationId, organisation.id))

  // 3) Define subjects with their groups and competences
  const subjects = [
    {
      name: "Mathematik",
      color: "red",
      grades: [1, 2, 3, 4, 5, 6],
      groups: [
        {
          name: "Zahlen und Operationen",
          competences: [
            "Natürliche Zahlen verstehen und darstellen",
            "Grundrechenarten sicher anwenden",
            "Rechengesetze und Rechenvorteile nutzen",
            "Überschlagsrechnungen durchführen",
            "Zahlenrätsel und Knobelaufgaben lösen",
            "Mit Brüchen und Dezimalzahlen rechnen",
            "Prozentrechnung anwenden"
          ]
        },
        {
          name: "Raum und Form",
          competences: [
            "Geometrische Grundformen erkennen und benennen",
            "Symmetrien erkennen und erzeugen",
            "Flächen und Körper untersuchen",
            "Mit Geodreieck und Zirkel konstruieren",
            "Flächeninhalte und Umfänge berechnen",
            "Raumvorstellung entwickeln"
          ]
        },
        {
          name: "Größen und Messen",
          competences: [
            "Längen messen und umrechnen",
            "Gewichte schätzen und messen",
            "Zeitspannen berechnen",
            "Mit Geld rechnen",
            "Volumen und Hohlmaße verstehen",
            "Maßstäbe anwenden"
          ]
        },
        {
          name: "Daten und Zufall",
          competences: [
            "Daten sammeln und darstellen",
            "Diagramme lesen und erstellen",
            "Mittelwerte berechnen",
            "Wahrscheinlichkeiten einschätzen",
            "Zufallsexperimente durchführen"
          ]
        }
      ]
    },
    {
      name: "Deutsch",
      color: "blue",
      grades: [1, 2, 3, 4, 5, 6],
      groups: [
        {
          name: "Sprechen und Zuhören",
          competences: [
            "Deutlich und verständlich sprechen",
            "Aktiv zuhören und nachfragen",
            "Gesprächsregeln einhalten",
            "Vor der Klasse präsentieren",
            "Gedichte vortragen",
            "Diskussionen führen",
            "Feedback geben und annehmen"
          ]
        },
        {
          name: "Lesen",
          competences: [
            "Flüssig und sinnbetont lesen",
            "Texte verstehen und zusammenfassen",
            "Verschiedene Textarten unterscheiden",
            "Lesestrategien anwenden",
            "Informationen aus Texten entnehmen",
            "Literarische Texte interpretieren",
            "Sachtexte analysieren",
            "Lesefreude entwickeln"
          ]
        },
        {
          name: "Schreiben",
          competences: [
            "Rechtschreibregeln anwenden",
            "Texte planen und strukturieren",
            "Verschiedene Textarten verfassen",
            "Kreativ schreiben",
            "Texte überarbeiten",
            "Grammatik korrekt anwenden",
            "Wortschatz erweitern",
            "Schreibmotivation entwickeln"
          ]
        },
        {
          name: "Sprache untersuchen",
          competences: [
            "Wortarten bestimmen",
            "Satzglieder erkennen",
            "Zeitformen bilden",
            "Fälle richtig verwenden",
            "Wortfamilien bilden",
            "Sprachliche Mittel erkennen"
          ]
        }
      ]
    },
    {
      name: "Englisch",
      color: "indigo",
      grades: [3, 4, 5, 6],
      groups: [
        {
          name: "Listening",
          competences: [
            "Einfache Anweisungen verstehen",
            "Kurze Dialoge verstehen",
            "Lieder und Reime verstehen",
            "Geschichten folgen",
            "Hauptinformationen erfassen",
            "Details heraushören"
          ]
        },
        {
          name: "Speaking",
          competences: [
            "Sich vorstellen können",
            "Einfache Fragen stellen und beantworten",
            "Über Familie und Hobbys sprechen",
            "Gefühle ausdrücken",
            "In Alltagssituationen kommunizieren",
            "Kurze Präsentationen halten",
            "An Gesprächen teilnehmen"
          ]
        },
        {
          name: "Reading",
          competences: [
            "Einzelne Wörter lesen",
            "Kurze Sätze verstehen",
            "Einfache Texte lesen",
            "Bildgeschichten verstehen",
            "Anleitungen folgen",
            "Informationen entnehmen"
          ]
        },
        {
          name: "Writing",
          competences: [
            "Wörter richtig schreiben",
            "Kurze Sätze bilden",
            "Postkarten schreiben",
            "Steckbriefe erstellen",
            "Kurze Geschichten verfassen",
            "Listen und Notizen machen"
          ]
        }
      ]
    },
    {
      name: "Sachunterricht",
      color: "green",
      grades: [1, 2, 3, 4],
      groups: [
        {
          name: "Natur und Leben",
          competences: [
            "Tiere und Pflanzen beobachten",
            "Lebensräume erkunden",
            "Jahreszeiten verstehen",
            "Wetter beobachten und dokumentieren",
            "Umweltschutz praktizieren",
            "Gesunde Ernährung verstehen",
            "Körper und Sinne erforschen",
            "Experimente durchführen"
          ]
        },
        {
          name: "Technik und Arbeitswelt",
          competences: [
            "Einfache Maschinen verstehen",
            "Werkzeuge sicher nutzen",
            "Materialien untersuchen",
            "Bauen und Konstruieren",
            "Berufe kennenlernen",
            "Verkehrserziehung anwenden"
          ]
        },
        {
          name: "Raum und Mobilität",
          competences: [
            "Sich im Raum orientieren",
            "Karten lesen",
            "Heimatort erkunden",
            "Verkehrsmittel vergleichen",
            "Wege beschreiben",
            "Himmelsrichtungen bestimmen"
          ]
        },
        {
          name: "Zeit und Wandel",
          competences: [
            "Zeitabläufe verstehen",
            "Geschichte der Heimat erforschen",
            "Früher und heute vergleichen",
            "Traditionen kennenlernen",
            "Zeitleisten erstellen",
            "Quellen untersuchen"
          ]
        }
      ]
    },
    {
      name: "Kunst",
      color: "purple",
      grades: [1, 2, 3, 4, 5, 6],
      groups: [
        {
          name: "Malen und Zeichnen",
          competences: [
            "Mit verschiedenen Farben experimentieren",
            "Mischtechniken anwenden",
            "Perspektivisch zeichnen",
            "Portraits gestalten",
            "Landschaften malen",
            "Abstrakte Kunst schaffen",
            "Farbenlehre verstehen"
          ]
        },
        {
          name: "Plastisches Gestalten",
          competences: [
            "Mit Ton modellieren",
            "Pappmaché-Objekte herstellen",
            "Drahtfiguren biegen",
            "Gips gießen und bearbeiten",
            "Recycling-Kunst schaffen",
            "Skulpturen bauen"
          ]
        },
        {
          name: "Drucken und Textiles",
          competences: [
            "Stempeldruck anwenden",
            "Linolschnitt erstellen",
            "Stoffdruck gestalten",
            "Weben und Flechten",
            "Nähen und Sticken",
            "Batik-Techniken nutzen"
          ]
        }
      ]
    },
    {
      name: "Musik",
      color: "yellow",
      grades: [1, 2, 3, 4, 5, 6],
      groups: [
        {
          name: "Singen und Sprechen",
          competences: [
            "Lieder sicher singen",
            "Stimmbildung üben",
            "Kanons singen",
            "Rhythmisch sprechen",
            "Atemtechnik anwenden",
            "Mehrstimmig singen",
            "Lieder begleiten"
          ]
        },
        {
          name: "Instrumentalspiel",
          competences: [
            "Rhythmusinstrumente spielen",
            "Melodien auf Stabspielen",
            "Blockflöte spielen",
            "Gitarre Grundlagen",
            "Keyboard erkunden",
            "Im Ensemble spielen",
            "Instrumente pflegen"
          ]
        },
        {
          name: "Musik hören",
          competences: [
            "Instrumente erkennen",
            "Musikstile unterscheiden",
            "Komponisten kennenlernen",
            "Musikstücke analysieren",
            "Gefühle in Musik erkennen",
            "Konzerte besuchen"
          ]
        },
        {
          name: "Musik und Bewegung",
          competences: [
            "Zur Musik tanzen",
            "Bewegungslieder umsetzen",
            "Choreografien entwickeln",
            "Body Percussion",
            "Musikalische Spiele",
            "Rhythmus in Bewegung"
          ]
        }
      ]
    },
    {
      name: "Sport",
      color: "emerald",
      grades: [1, 2, 3, 4, 5, 6],
      groups: [
        {
          name: "Laufen, Springen, Werfen",
          competences: [
            "Ausdauernd laufen",
            "Sprint trainieren",
            "Weitsprung üben",
            "Hochsprung lernen",
            "Ballwurf verbessern",
            "Staffellauf meistern",
            "Hindernislauf bewältigen",
            "Koordination schulen"
          ]
        },
        {
          name: "Turnen und Bewegungskünste",
          competences: [
            "Rolle vorwärts und rückwärts",
            "Handstand üben",
            "Am Reck turnen",
            "Balancieren",
            "Sprünge am Kasten",
            "Bodenturnen",
            "Akrobatik in Gruppen",
            "Bewegungsabläufe gestalten"
          ]
        },
        {
          name: "Spielen",
          competences: [
            "Fußball spielen",
            "Basketball Grundlagen",
            "Volleyball üben",
            "Handball lernen",
            "Kleine Spiele leiten",
            "Fair Play zeigen",
            "Taktik verstehen",
            "Teamgeist entwickeln"
          ]
        },
        {
          name: "Schwimmen",
          competences: [
            "Wassergewöhnung",
            "Brustschwimmen",
            "Kraulschwimmen",
            "Rückenschwimmen",
            "Tauchen",
            "Springen vom Brett",
            "Ausdauer im Wasser",
            "Rettungsschwimmen Basics"
          ]
        }
      ]
    },
    {
      name: "Religion/Ethik",
      color: "violet",
      grades: [1, 2, 3, 4, 5, 6],
      groups: [
        {
          name: "Ich und die Anderen",
          competences: [
            "Eigene Gefühle wahrnehmen",
            "Empathie entwickeln",
            "Konflikte lösen",
            "Freundschaft pflegen",
            "Respekt zeigen",
            "Verantwortung übernehmen",
            "Gemeinschaft gestalten"
          ]
        },
        {
          name: "Fragen nach Gott",
          competences: [
            "Gottesbilder kennenlernen",
            "Gebete sprechen",
            "Biblische Geschichten verstehen",
            "Symbole deuten",
            "Feste feiern",
            "Glauben reflektieren"
          ]
        },
        {
          name: "Religionen und Kulturen",
          competences: [
            "Weltreligionen kennenlernen",
            "Feste verschiedener Religionen",
            "Toleranz üben",
            "Gemeinsamkeiten entdecken",
            "Unterschiede respektieren",
            "Dialog führen"
          ]
        },
        {
          name: "Werte und Normen",
          competences: [
            "Gerechtigkeit verstehen",
            "Ehrlichkeit praktizieren",
            "Hilfsbereitschaft zeigen",
            "Umweltethik entwickeln",
            "Regeln reflektieren",
            "Gewissen schulen"
          ]
        }
      ]
    },
    {
      name: "Naturwissenschaften",
      color: "sky",
      grades: [5, 6],
      groups: [
        {
          name: "Biologie",
          competences: [
            "Lebewesen klassifizieren",
            "Ökosysteme verstehen",
            "Körperfunktionen erforschen",
            "Mikroskopieren lernen",
            "Evolution begreifen",
            "Genetik Grundlagen",
            "Umweltschutz praktizieren",
            "Artenvielfalt schützen"
          ]
        },
        {
          name: "Chemie",
          competences: [
            "Stoffe und ihre Eigenschaften",
            "Aggregatzustände verstehen",
            "Einfache Reaktionen",
            "Säuren und Basen",
            "Laborgeräte nutzen",
            "Sicherheit im Labor",
            "Alltagschemie erkunden"
          ]
        },
        {
          name: "Physik",
          competences: [
            "Kräfte und Bewegung",
            "Energie verstehen",
            "Elektrizität erforschen",
            "Magnetismus untersuchen",
            "Optik Grundlagen",
            "Schall und Akustik",
            "Wärmelehre basics",
            "Experimente planen"
          ]
        }
      ]
    },
    {
      name: "Informatik",
      color: "orange",
      grades: [3, 4, 5, 6],
      groups: [
        {
          name: "Grundlagen der Informatik",
          competences: [
            "Computer bedienen",
            "Dateien organisieren",
            "Internet sicher nutzen",
            "E-Mails schreiben",
            "Suchmaschinen verwenden",
            "Digitale Kommunikation"
          ]
        },
        {
          name: "Programmieren",
          competences: [
            "Algorithmen verstehen",
            "Scratch programmieren",
            "Schleifen anwenden",
            "Bedingungen nutzen",
            "Variablen einsetzen",
            "Debugging lernen",
            "Spiele entwickeln",
            "Roboter steuern"
          ]
        },
        {
          name: "Medienbildung",
          competences: [
            "Medien kritisch nutzen",
            "Fake News erkennen",
            "Urheberrecht beachten",
            "Präsentationen erstellen",
            "Videos bearbeiten",
            "Fotos gestalten",
            "Datenschutz verstehen",
            "Cybermobbing vermeiden"
          ]
        }
      ]
    }
  ]

  // 4) Wrap inserts in a transaction for safety
  await db.transaction(async (tx) => {
    // recursive helper
    async function insertNode(
      node: {
        id?: string
        name: string
        color?: string
        grades?: number[]
        children?: (typeof node)[]
      },
      parentId: string | null = null,
      competenceType: "subject" | "group" | "competence" = "subject"
    ) {
      const id = node.id ?? nanoid()
      await tx.insert(competences).values({
        id,
        name: node.name,
        competenceType,
        color: node.color ?? "",
        grades: node.grades ?? [],
        competenceId: parentId,
        organisationId: organisation.id
      })
      if (node.children) {
        for (const child of node.children) {
          const childType = competenceType === "subject" ? "group" : "competence"
          await insertNode(child, id, childType)
        }
      }
    }

    // start recursion
    for (const subject of subjects) {
      const subjectId = nanoid()
      await tx.insert(competences).values({
        id: subjectId,
        name: subject.name,
        competenceType: "subject",
        color: subject.color,
        grades: subject.grades,
        competenceId: null,
        organisationId: organisation!.id
      })

      // Insert groups
      for (const group of subject.groups) {
        const groupId = nanoid()
        await tx.insert(competences).values({
          id: groupId,
          name: group.name,
          competenceType: "group",
          color: "",
          grades: subject.grades,
          competenceId: subjectId,
          organisationId: organisation!.id
        })

        // Insert competences
        for (const competenceName of group.competences) {
          await tx.insert(competences).values({
            id: nanoid(),
            name: competenceName,
            competenceType: "competence",
            color: "",
            grades: subject.grades,
            competenceId: groupId,
            organisationId: organisation!.id
          })
        }
      }
    }
  })

  console.log("All competences imported successfully!")
}

// run it
await importCompetencesRecursively()

process.exit(0)
