export interface AvatarItem {
  id: string;
  url: string;
  category: "adults" | "children" | "babies" | "friends" | "pets";
  label: string;
}

export const AVATAR_CATEGORIES = [
  { id: "adults", name: "Adults & Seniors" },
  { id: "children", name: "Children & Teens" },
  { id: "babies", name: "Babies & Toddlers" },
  { id: "friends", name: "Friends & Neighbors" },
  { id: "pets", name: "Family Pets" }
] as const;

// Programmatically generate a rich set of 85 highly diverse avatars using Dicebear style parameters
const generateAvatars = (): AvatarItem[] => {
  const list: AvatarItem[] = [];

  // Adults: 25 Avatars (Diverse skin tones, hair, accessories)
  const adultNames = [
    "Young Male (Athletic)", "Young Female (Professional)", "Elderly Grandma", "Elderly Grandpa",
    "Middle-aged Dad", "Middle-aged Mom", "Teacher Male", "Doctor Female",
    "Curly Hair Woman", "Bearded Uncle", "Hijab Sister", "Turban Brother",
    "Bald Senior", "Short Hair Brother", "Wavy Hair Sister", "Dreadlock Professional",
    "Glasses Senior Woman", "Glasses Student Male", "Active Grandma", "Retired Neighbor Male",
    "Corporate Manager Female", "Researcher Male", "Creative Artist Female", "Athletic Runner Female",
    "Friendly Doctor Male"
  ];
  for (let i = 1; i <= 25; i++) {
    const isFemale = i % 2 === 0;
    const style = isFemale ? "lorelei" : "avataaars";
    list.push({
      id: `adult-${i}`,
      url: `https://api.dicebear.com/7.x/${style}/svg?seed=adult-seed-${i}&radius=50&backgroundColor=f0f3ff,dee8ff,c9e6ff`,
      category: "adults",
      label: adultNames[i - 1] || `Adult Profile ${i}`
    });
  }

  // Children: 20 Avatars
  const kidNames = [
    "Teenager Boy", "School Girl", "Toddler Boy", "Teenager Girl",
    "Active Boy", "Glasses Boy", "Curly Hair Girl", "Cap Wearer Boy",
    "Ribbon Hair Girl", "Ponytail Girl", "Playful Kid Boy", "Smiling Kid Girl",
    "Toddler Girl", "Highschooler Male", "Highschooler Female", "Spiky Hair Kid",
    "Braid Hair Girl", "Summer Cap Kid", "Smart Kid Male", "Cheerful Kid Female"
  ];
  for (let i = 1; i <= 20; i++) {
    list.push({
      id: `child-${i}`,
      url: `https://api.dicebear.com/7.x/open-peeps/svg?seed=child-seed-${i}&radius=50&backgroundColor=dee8ff,e7eeff`,
      category: "children",
      label: kidNames[i - 1] || `Child Profile ${i}`
    });
  }

  // Babies: 15 Avatars
  for (let i = 1; i <= 15; i++) {
    list.push({
      id: `baby-${i}`,
      url: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=baby-seed-${i}&radius=50&backgroundColor=ffdad6,f0f3ff`,
      category: "babies",
      label: `Baby Care ${i}`
    });
  }

  // Friends & Neighbors: 15 Avatars
  const friendLabels = [
    "Male Friend", "Female Friend", "Neighbor", "Colleague", "Roommate",
    "Caregiver", "Nurse", "Therapist", "Gym Partner", "Club Member",
    "Aunt", "Uncle", "Cousin Male", "Cousin Female", "Support Worker"
  ];
  for (let i = 1; i <= 15; i++) {
    list.push({
      id: `friend-${i}`,
      url: `https://api.dicebear.com/7.x/pixel-art/svg?seed=friend-seed-${i}&radius=50&backgroundColor=e7eeff,c9e6ff`,
      category: "friends",
      label: friendLabels[i - 1] || `Contact ${i}`
    });
  }

  // Pets: 10 Avatars
  const petLabels = [
    "Golden Retriever Dog", "Tabby Cat", "Canary Bird", "French Bulldog",
    "Siamese Cat", "Cute Puppy", "Fluffy Kitten", "Parrot", "Rabbit", "Hamster"
  ];
  const petUrls = [
    "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1522858547137-f1dcee55d6aa?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1537151608828-ea2b117b62e4?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1552728089-57bdde30ebd3?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=150&auto=format&fit=crop&q=80"
  ];
  for (let i = 1; i <= 10; i++) {
    list.push({
      id: `pet-${i}`,
      url: petUrls[i - 1],
      category: "pets",
      label: petLabels[i - 1] || `Pet ${i}`
    });
  }

  return list;
};

export const AVATAR_ITEMS = generateAvatars();
