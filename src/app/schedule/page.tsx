import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin } from 'lucide-react';
import { getSchedule } from '@/lib/firebase-service';

export default async function SchedulePage() {
  const scheduleData = await getSchedule();

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground">Conference Schedule</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Plan your time at HARMUN 2025. Here is the official schedule of events.
        </p>
      </div>

      <div className="space-y-12">
        {scheduleData.length > 0 ? (
          scheduleData.map((day, dayIndex) => (
            <div key={day.id} className="animate-fade-in-up" style={{ animationDelay: `${dayIndex * 250}ms` }}>
              <h2 className="text-2xl md:text-3xl font-bold font-headline text-foreground mb-2">{day.title}</h2>
              <p className="text-md text-muted-foreground mb-6">{day.date}</p>
              <div className="relative border-l-2 border-primary/50 pl-8 space-y-8">
                {day.events.length > 0 ? (
                    day.events.map((event) => (
                    <div key={event.id} className="relative">
                      <div className="absolute -left-[39px] top-1 h-4 w-4 rounded-full bg-primary border-4 border-background" />
                      <Card className="animate-fade-in-up">
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
                  ))
                ) : (
                    <p className="text-muted-foreground">No events scheduled for this day.</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-muted-foreground animate-fade-in-up">
            <p>The conference schedule has not been released yet. Please check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
