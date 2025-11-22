const Meleane1 = [
  {
    "name": "Urgent Communications",
    "subject": "Call Sione",
    "relatedObservations": [
      "uIex2NHmSV3aYWGgyPsj"
    ],
    "tracking": {
      "reason": "Sione sent an SMS requesting an urgent conversation with you.",
      "isPriority": true,
      "actions": [
        {
          "app": "Phone",
          "intent": "Call",
          "data": {
            "recipient": "Sione"
          }
        }
      ]
    }
  },
  {
    "name": "Personal Admin",
    "subject": "Calling Phone Company",
    "relatedObservations": [
      "lyauPWDdgSIkygzdoTZw",
      "SJgmBwtp5vQHRD2FjG45",
      "xmDC5rY19QhNfJUU8tmR",
      "1fQ3drj3GzI7zwE2kwQo"
    ],
    "tracking": {
      "reason": "You are actively trying to call the phone company and experiencing frustration with your tablet.",
      "isPriority": true,
      "actions": [
        {
          "app": "Phone",
          "intent": "Call",
          "data": {
            "q": "Phone company customer service"
          }
        }
      ]
    }
  },
  {
    "name": "Household Chores",
    "subject": "Maka to Cut Grass",
    "relatedObservations": [
      "oqdnBQNhgU2npIbMX2IE",
      "U37LdDhMcGBS3iXlnpEp",
      "VaYZQPdQoHIGJvS1kLks",
      "ZEAfm1tWeiR1insIlFdj",
      "MZ6sdkt5ccPeDu9hoBpI"
    ],
    "tracking": {
      "reason": "You are repeatedly instructing Maka to cut the grass, emphasizing its urgency.",
      "isPriority": true,
      "actions": []
    }
  },
  {
    "name": "Household Chores",
    "subject": "Watering the Taro",
    "relatedObservations": [
      "a1ywbL3fCJbrnSHcTpke"
    ],
    "tracking": {
      "reason": "Ana sent a reminder, asking if you remembered to water the taro.",
      "isPriority": false,
      "actions": []
    }
  },
  {
    "name": "Community Activities",
    "subject": "Women's Guild Meeting",
    "relatedObservations": [
      "KvNqizHsmq2VpiwXqYGV"
    ],
    "tracking": {
      "reason": "Sela Fatai reminded you about an early women's guild hymn selection discussion.",
      "isPriority": false,
      "actions": [
        {
          "app": "Calendar",
          "intent": "AddEvent",
          "data": {
            "title": "Women's Guild Hymn Discussion",
            "start": "2025-11-15 06:45:28"
          }
        }
      ]
    }
  },
  {
    "name": "Personal Admin",
    "subject": "Top Up Mobile Data",
    "relatedObservations": [
      "93kGiFMP26QNRG5YctRC"
    ],
    "tracking": {
      "reason": "Your mobile data bundle is low with 200MB remaining, requiring a top-up.",
      "isPriority": false,
      "expires": "Soon",
      "actions": [
        {
          "app": "Digicel Tonga",
          "intent": "TopUp",
          "data": {}
        }
      ]
    }
  },
  {
    "name": "Household Chores",
    "subject": "Market Shopping Advice for Ana",
    "relatedObservations": [
      "5ocWR9ESZKgWh1mlRgbz"
    ],
    "tracking": {
      "reason": "You gave Ana specific instructions for market shopping, including haggling.",
      "isPriority": false,
      "actions": []
    }
  },
  {
    "name": "Personal Reflections on Society",
    "subject": "Views on Waste and Youth",
    "relatedObservations": [
      "MByU0R9rquHf2t48vKWB",
      "de25q3XloYHXHUy5ALXV",
      "TvttOI53XwZS6Z7fXqjj",
      "juYBq3iSw2a2PFjY2VFa"
    ],
    "tracking": {
      "reason": "You expressed strong opinions on modern wastefulness, youth's screen habits, and societal changes.",
      "isPriority": false,
      "actions": []
    }
  }
];



const Melanie2 = [
  {
    "name": "Academics",
    "subject": "Chemistry Test Prep",
    "relatedObservations": [
      "JuurMZlbyLne8HqkRmcn",
      "ynYDZOBNWuXhVNy0TCrL",
      "UxDGuTEJkQV6K5rbRSk5",
      "pzi9yWLLZEWuL75JRsfi",
      "67cJ4OqOeW9sYgTGFX4P",
      "Vd3HXFLsGq5H54xUsdQs",
      "Ple2Y2loerggmSTqsYpA",
      "qIfN1yBvT3upiSHTsk2a",
      "ia2l7Va0KQJOtBW7lBU4",
      "2CGvqQ2YDnWCS4OceJ3N",
      "1HNNu5PEFkCKYDxBMjGf",
      "EZSVERVaZxIFC7nwjr7K",
      "1eBfuxC4YvKziYxC9oId",
      "Kwu069vGgByiGB1bnohc",
      "J2mYpIDru9ROQek4bLpO",
      "a4RbnFwlhQmhoz88wIs3",
      "lG2lATnqfJy8NKnE3eTH",
      "vwTXqlnU2eyi1J93PHAU",
      "ih49ag1u33dZbcMkaBgY",
      "PaMw5vag5o2mhrc0Qp3X",
      "ny7pN90mshjV4Ao3qmyU",
      "x3cYVgWmeeyOSMxhjF1W",
      "DU8mTxJ5ls4OvqNPlVCu",
      "AtuljxEFiTzHwzrEtuIE"
    ],
    "tracking": {
      "reason": "You are struggling with stoichiometry and limiting reactants for an upcoming test next week.",
      "isPriority": true,
      "expires": "Next week",
      "actions": [
        {
          "app": "YouTube",
          "intent": "Search",
          "data": {
            "q": "Understanding Limiting Reactants for Grade 11 Chemistry"
          }
        },
        {
          "app": "Quizlet",
          "intent": "Open",
          "data": {
            "set": "Chemistry Grade 11 - Stoichiometry"
          }
        },
        {
          "app": "Textbook",
          "intent": "Read",
          "data": {
            "subject": "Chemistry",
            "section": "Limiting Reactants",
            "problem": "3"
          }
        }
      ]
    }
  },
  {
    "name": "Academics",
    "subject": "Physics Assignment",
    "relatedObservations": [
      "9hFCeP1DRIEwPdgyRMbJ",
      "ALunOeFML2Jt3WSSBsC0",
      "gtJc2q65Xq71ElympaGn",
      "RNatmr2zYw7Q7Nc9Rj0Y",
      "PgbzvaOqo2gOCYy3HT81"
    ],
    "tracking": {
      "reason": "A Physics assignment on Newton's Laws is due end of day tomorrow to Mr. Tembo's office.",
      "isPriority": true,
      "expires": "Tomorrow EOD",
      "actions": [
        {
          "app": "File Manager",
          "intent": "Check",
          "data": {
            "q": "Physics assignment Newton's Laws"
          }
        },
        {
          "app": "School",
          "intent": "Submit",
          "data": {
            "to": "Mr. Tembo's office",
            "assignment": "Physics Newton's Laws"
          }
        }
      ]
    }
  },
  {
    "name": "Personal TODOs",
    "subject": "Errands & Family Reminders",
    "relatedObservations": [
      "B7W4f1isdliIk5KLd5ti",
      "r4hUNxjdwZPJvTmfPn25",
      "aaPNtO6Qjxn9OB38BPjx",
      "gqtER7gRg9zUWGi3WFyD",
      "8RfPeKQhwrj3RXCCqGR0"
    ],
    "tracking": {
      "reason": "You have reminders from family to check on Mizinga, pick up bread, and prepare market clothes.",
      "isPriority": true,
      "expires": "Today after school / Tomorrow morning",
      "actions": [
        {
          "app": "Family",
          "intent": "CheckIn",
          "data": {
            "person": "Mizinga",
            "time": "after school"
          }
        },
        {
          "app": "Store",
          "intent": "Pickup",
          "data": {
            "item": "bread",
            "location": "Mr. Tembo's"
          }
        },
        {
          "app": "Home",
          "intent": "Prepare",
          "data": {
            "item": "market clothes",
            "time": "for tomorrow morning"
          }
        }
      ]
    }
  },
  {
    "name": "Academics",
    "subject": "Math Homework",
    "relatedObservations": [
      "0KZRvheBq3QC4jRqcO9q",
      "1XirJskkngrLdE3J14Ne",
      "D6V8LAHJq0nqEjfythwm",
      "Wzwwty0Q7R8zrVhBiHCi",
      "NH0LbxsYNZYPIoU7z5T7",
      "mdE7Gr0KFMMaJrMr1msg",
      "mlVm9HQK5w9U9eMwPWC6",
      "vQHXXFK1zoQ7vyj8xzGu",
      "infR1vRcC6e2JYsM5vzk",
      "DSoByhSqO1sBjJWMrjpW"
    ],
    "tracking": {
      "reason": "You were assigned Math homework (exercises 5-10 on page 115) to be reviewed tomorrow.",
      "isPriority": false,
      "expires": "Tomorrow",
      "actions": [
        {
          "app": "Textbook",
          "intent": "Complete",
          "data": {
            "subject": "Math",
            "page": "115",
            "exercises": "5-10"
          }
        }
      ]
    }
  },
  {
    "name": "Academics",
    "subject": "History Project",
    "relatedObservations": [
      "ia2l7Va0KQJOtBW7lBU4",
      "T9lRteIzW8SSOdymhbvI",
      "S30pJrSBSnAZUx5wD6HO",
      "bI0JrLZaJkZ8XckwKi1p",
      "AtuljxEFiTzHwzrEtuIE"
    ],
    "tracking": {
      "reason": "You received positive feedback on your history project content, but need to improve bibliography format.",
      "isPriority": false,
      "expires": "N/A",
      "actions": [
        {
          "app": "Self-improvement",
          "intent": "Learn",
          "data": {
            "topic": "Academic bibliography formatting (italicizing book titles)"
          }
        }
      ]
    }
  },
  {
    "name": "Academics",
    "subject": "Classroom Participation",
    "relatedObservations": [
      "X59mfm2EdIQKcZ0Ui0uX",
      "blCe1D881hazLAIrDo3D",
      "X3LcNwP3XiJOGFjmukuI",
      "MCYeLceOnrcwyIGEJRAd",
      "IoykfzsjU57TjCoLpj5X",
      "bduj55MSYRY3dL7Fs3lX",
      "piU9tg0hW3j90oT3OUDJ",
      "wE8pvlerEc43uj0KG0UY"
    ],
    "tracking": {
      "reason": "You experienced elevated heart rate and nervousness during history reading practice in class.",
      "isPriority": false,
      "expires": "N/A",
      "actions": []
    }
  }
];


const Jaime1 = [
  {
    "name": "Commute",
    "subject": "MTR Travel",
    "relatedObservations": [
      "LFMADUTYVolBeQFzWXe4",
      "12kLwpZ99uP0XyGMAsVg",
      "jcIZrAHl33p5Bv7y9Xkp",
      "5tvwPcfMSVAUmO84rc0r",
      "CRQJczAu2Vi6CWguihjz",
      "sQV2tVZsYzhPZoH1eSk0",
      "apbOEVVXsdaXEFoGhYfW",
      "UmAXvskSpwWXmzS4UUhn",
      "9MpUUi8Xkt3xq1Sz8zGa",
      "l1zvkgzehosxruERQ37z",
      "Serd2JUaY1eiMWjd7GNf",
      "PJWkN0dDlhiBv3vp2tub",
      "nCgxus4jrLlmuC4cBSuK",
      "jWD5mTXZtDaPFPaLRYFR"
    ],
    "tracking": {
      "reason": "MTR service is delayed, impacting your travel time to your destination.",
      "isPriority": true,
      "expires": "End of commute",
      "actions": [
        {
          "app": "MTR Mobile",
          "intent": "CheckServiceStatus",
          "data": {
            "line": "Island Line"
          }
        },
        {
          "app": "WhatsApp",
          "intent": "SendMessage",
          "data": {
            "recipient": "Chloe Wong",
            "message": "Thanks for the heads up! Just got on the MTR."
          }
        }
      ]
    }
  },
  {
    "name": "Academics",
    "subject": "Chemistry Quiz Prep",
    "relatedObservations": [
      "sZgzG5v6FtC1OojConRL",
      "12kLwpZ99uP0XyGMAsVg",
      "VJI1LIEqDbdhGVUC8RQ6"
    ],
    "tracking": {
      "reason": "You are reviewing Chemistry formulas, likely for an upcoming quiz or test.",
      "isPriority": true,
      "expires": "This morning",
      "actions": [
        {
          "app": "Notes",
          "intent": "Open",
          "data": {
            "query": "Chemistry formulas"
          }
        },
        {
          "app": "Calendar",
          "intent": "CheckEvents",
          "data": {
            "date": "2025-11-07"
          }
        }
      ]
    }
  },
  {
    "name": "Hobby",
    "subject": "Hong Kong Street Art",
    "relatedObservations": [
      "y6hlqmtSGpxB6Dd9bCKx",
      "eKq7PFh4J2ahKrWwynHP",
      "jArTT6byNhNmv9S78Lif",
      "vojHICSKlVKcTlo53oRt"
    ],
    "tracking": {
      "reason": "You're noticing street art and receiving related social media updates during your commute.",
      "isPriority": false,
      "expires": "N/A",
      "actions": [
        {
          "app": "Instagram",
          "intent": "OpenProfile",
          "data": {
            "profile": "StreetArtHK_Feed"
          }
        },
        {
          "app": "Camera",
          "intent": "TakePicture",
          "data": {
            "caption": "New Sheung Wan murals!"
          }
        }
      ]
    }
  }
]

export const Jaime = { id: "UtNtD1I9ZmRWBPWEl64s", date: "2025-11-07"}
export const Jaime2 = [
  {
    "name": "Social Plans",
    "subject": "Queer Youth Space HK Meetup",
    "relatedObservations": [
      "zntiCBcoaQsQ2EBN8wdU",
      "gVXciAflTtBmGS9Im4tz"
    ],
    "tracking": {
      "reason": "You received a reminder for a meetup happening tonight.",
      "isPriority": true,
      "expires": "Tonight  JJJJJJJ AAAAA SSSSS DDDD",
      "actions": [
        {
          "app": "Calendar",
          "intent": "AddEvent",
          "data": {
            "title": "Queer Youth Space HK Meetup",
            "start": "2025-11-07 19:00:00",
            "end": "2025-11-07 21:00:00"
          }
        }
      ]
    }
  },
  {
    "name": "Family Chores",
    "subject": "Groceries",
    "relatedObservations": [
      "EN5quCQtHHF1bE8FKXyh",
      "eHSPj0P1j847CZEAjTqB"
    ],
    "tracking": {
      "reason": "Your dad sent money and reminded you to get groceries after school.",
      "isPriority": true,
      "expires": "Today after school",
      "actions": [
        {
          "app": "Shopping List",
          "intent": "View",
          "data": {}
        },
        {
          "app": "Maps",
          "intent": "Search",
          "data": {
            "q": "supermarket near current location"
          }
        }
      ]
    }
  },
  {
    "name": "Academics",
    "subject": "Help Maya with Math",
    "relatedObservations": [
      "nn3rFpDpr640Qa32hF9C",
      "feRbqFZ8LZJQtWzra0lo"
    ],
    "tracking": {
      "reason": "Maya urgently needs your help with Algebra Q7 after school.",
      "isPriority": true,
      "expires": "Today after school",
      "actions": [
        {
          "app": "WhatsApp",
          "intent": "SendMessage",
          "data": {
            "recipient": "Maya Lee",
            "message": "Hey Maya, I can help you with Q7 later today!"
          }
        }
      ]
    }
  },
  {
    "name": "Social Plans",
    "subject": "Cat Cafe with Chloe & Ethan",
    "relatedObservations": [
      "Shdf0sTdH5TWVvTQFKKw",
      "7XxnhCSvDCgdqlmjsipP",
      "LZOtGfJ3VRkRoQyZUCVi",
      "yCaWnV4U62drYHQm9Crx",
      "gVXciAflTtBmGS9Im4tz",
      "hk6E81Uy3FGLFsTH6vZo",
      "VLh0s8MTVKTOZ83sepnI",
      "B4405Lw3Q6ylJD0NxNRq",
      "CubPlUb24yzVbw0JQ1Jr",
      "G47tbDGST0QCZb7F3qpp",
      "YK7YNESWjAwidJtXKG3f",
      "JkcnEj9M561IZtMoOmIN",
      "f7ooyWKv59njWO7EFLhO"
    ],
    "tracking": {
      "reason": "Plans for the cat cafe are confirmed for Saturday 2 PM; Chloe is excited.",
      "isPriority": false,
      "expires": "Saturday 2 PM",
      "actions": [
        {
          "app": "WhatsApp",
          "intent": "SendMessage",
          "data": {
            "recipient": "Chloe Wong",
            "message": "Saturday 2 PM sounds perfect! I'll book it. What art were you thinking of bringing?"
          }
        },
        {
          "app": "Calendar",
          "intent": "AddEvent",
          "data": {
            "title": "Cat Cafe with Chloe & Ethan",
            "start": "2025-11-09 14:00:00",
            "end": "2025-11-09 16:00:00"
          }
        },
        {
          "app": "Safari",
          "intent": "OpenURL",
          "data": {
            "url": "search_for_cat_cafe_booking"
          }
        }
      ]
    }
  },
  {
    "name": "Academics",
    "subject": "Mid-term & Quiz Prep",
    "relatedObservations": [
      "wpQPokZxVPd4OURKsgiX",
      "mJSnzRRWlLqOtR485wLp",
      "eHSPj0P1j847CZEAjTqB",
      "xOax0TiL3im3Jf0JhRXb",
      "0ymQOCBad6B7IFqUk0O0",
      "dcSWeEjF30oSEa1AUnDX",
      "RJn2IKRk1qGOWesbIRvG",
      "RFbE7UAfHSry7xQ9nOES",
      "ttOYjqybPli3oCIG3n41"
    ],
    "tracking": {
      "reason": "Teachers reminded you about an upcoming mid-term and quiz next week.",
      "isPriority": false,
      "expires": "Next Week",
      "actions": [
        {
          "app": "Notes",
          "intent": "Open",
          "data": {
            "q": "Physics notes"
          }
        },
        {
          "app": "Textbook",
          "intent": "Open",
          "data": {
            "chapter": "7,8"
          }
        }
      ]
    }
  },
  {
    "name": "Creative Project",
    "subject": "Art Competition Piece",
    "relatedObservations": [
      "Qlz1MUNynTOKkvLUi0Yd",
      "467F1Sra85fT6q7gEZv1",
      "yCaWnV4U62drYHQm9Crx",
      "r9PvaRDJJRZ3Ee16ClOz"
    ],
    "tracking": {
      "reason": "You're conceptualizing a fantasy guardian character for an art competition.",
      "isPriority": false,
      "actions": [
        {
          "app": "Drawing App",
          "intent": "Open",
          "data": {
            "project": "Art Competition Piece"
          }
        },
        {
          "app": "Safari",
          "intent": "Search",
          "data": {
            "q": "fantasy guardian character concept art"
          }
        },
        {
          "app": "Instagram",
          "intent": "ViewProfile",
          "data": {
            "user": "artof_lyra"
          }
        }
      ]
    }
  },
  {
    "name": "Gaming",
    "subject": "Catch up with Ethan",
    "relatedObservations": [
      "mCTQ0X9DbbUAA94WrpCB",
      "A1bEromHc6bl5rkn0Y6O",
      "gXf50JdixZlimoHuQ5VH",
      "Qlz1MUNynTOKkvLUi0Yd",
      "Vkr50SHN1RT0KlqT1h71",
      "tZPtvokzkLuL16lJfezK",
      "BXcRsYJvKs52wSjFi7ad"
    ],
    "tracking": {
      "reason": "Ethan sent multiple messages about gaming and a new game demo.",
      "isPriority": false,
      "actions": [
        {
          "app": "WhatsApp",
          "intent": "SendMessage",
          "data": {
            "recipient": "Ethan Chan",
            "message": "Hey, still up for gaming later? What wild theories do you have about the demo ending?"
          }
        },
        {
          "app": "Game",
          "intent": "Open",
          "data": {
            "title": "Pixel Knight Adventures"
          }
        }
      ]
    }
  }
]