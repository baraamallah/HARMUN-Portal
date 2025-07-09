import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ScheduleEvent } from '@/lib/types';
import { Clock, MapPin } from 'lucide-react';

const schedule: { day: string, date: string, events: ScheduleEvent[] }[] = [
  {
    day: 'Day 1: Thursday',
    date: 'January 30, 2025',
    events: [
      { time: '2:00 PM - 5:00 PM', title: 'Delegate Registration', description: 'Pick up your credentials and welcome packet.', location: 'Main Hall' },
      { time: '6:00 PM - 7:30 PM', title: 'Opening Ceremonies', description: 'Keynote speech and official start of the conference.', location: 'Grand Ballroom' },
      { time: '8:00 PM - 10:00 PM', title: 'Committee Session I', description: 'First session of debate and collaboration.', location: 'Assigned Committee Rooms' },
    ],
  },
  {
    day: 'Day 2: Friday',
    date: 'January 31, 2025',
    events: [
      { time: '9:00 AM - 12:00 PM', title: 'Committee Session II', description: 'Continued debate and drafting of resolutions.', location: 'Assigned Committee Rooms' },
      { time: '12:00 PM - 1:30 PM', title: 'Lunch Break', description: 'Enjoy lunch with fellow delegates.', location: 'Dining Hall' },
      { time: '1:30 PM - 5:00 PM', title: 'Committee Session III', description: 'Focus on merging working papers and finalizing clauses.', location: 'Assigned Committee Rooms' },
      { time: '7:00 PM - 9:00 PM', title: 'Delegate Social Event', description: 'A chance to relax and network.', location: 'Student Union' },
    ],
  },
  {
    day: 'Day 3: Saturday',
    date: 'February 1, 2025',
    events: [
      { time: '10:00 AM - 1:00 PM', title: 'Committee Session IV', description: 'Final debates on draft resolutions.', location: 'Assigned Committee Rooms' },
      { time: '1:00 PM - 2:30 PM', title: 'Lunch Break', description: 'Recharge for the final sessions.', location: 'Dining Hall' },
      { time: '2:30 PM - 5:00 PM', title: 'Committee Session V', description: 'Voting procedure and passage of resolutions.', location: 'Assigned Committee Rooms' },
      { time: '8:00 PM - 10:00 PM', title: 'Awards Ceremony & Gala', description: 'Recognizing outstanding delegates and celebrating a successful conference.', location: 'Grand Ballroom' },
    ]
  },
  {
    day: 'Day 4: Sunday',
    date: 'February 2, 2025',
    events: [
      { time: '9:00 AM - 11:00 AM', title: 'Closing Ceremonies', description: 'Final remarks and farewells.', location: 'Grand Ballroom' },
      { time: '11:00 AM', title: 'Conference Adjourns', description: 'Delegates depart.', location: 'N/A' },
    ]
  }
];


export default function SchedulePage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary-foreground">Conference Schedule</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Plan your time at HARMUN 2025. Here is the official schedule of events.
        </p>
      </div>

      <div className="space-y-12">
        {schedule.map((day) => (
          <div key={day.day}>
            <h2 className="text-2xl md:text-3xl font-bold font-headline text-primary-foreground mb-2">{day.day}</h2>
            <p className="text-md text-muted-foreground mb-6">{day.date}</p>
            <div className="relative border-l-2 border-primary/50 pl-8 space-y-8">
              {day.events.map((event, index) => (
                <div key={index} className="relative">
                  <div className="absolute -left-[39px] top-1 h-4 w-4 rounded-full bg-primary border-4 border-black" />
                  <Card>
                    <CardHeader>
                      <CardTitle>{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{event.description}</p>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
