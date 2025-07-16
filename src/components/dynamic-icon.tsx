
import * as React from 'react';
import * as Icons from 'lucide-react';

type IconName = keyof typeof Icons;

export const createDynamicIcon = (iconName: string, className?: string) => {
    const IconComponent = Icons[iconName as IconName] as React.ElementType;

    if (!IconComponent) {
        // Return a default icon or null if the requested icon doesn't exist
        return <Icons.HelpCircle className={className} />;
    }

    return <IconComponent className={className} />;
};

    