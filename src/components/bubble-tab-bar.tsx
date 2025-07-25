
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';
import { Home, Newspaper, Library, GalleryHorizontal } from 'lucide-react';

const navItems = [
    { id: 1, href: '/', icon: Home, color: '#1E3A8A' },
    { id: 2, href: '/committees', icon: Library, color: '#10B981' },
    { id: 3, href: '/news', icon: Newspaper, color: '#F59E0B' },
    { id: 4, href: '/gallery', icon: GalleryHorizontal, color: '#8B5CF6' },
];

const BubbleTabBar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [activeId, setActiveId] = useState(1);
    const navbarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const currentItem = navItems.find(item => pathname.startsWith(item.href) && (item.href === '/' ? pathname.length === 1 : true));
        const initialId = currentItem ? currentItem.id : 1;
        
        if (initialId !== activeId) {
             move(initialId, currentItem?.href || '/', currentItem?.color || '#1E3A8A', false);
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    useEffect(() => {
        const currentItem = navItems.find(item => pathname.startsWith(item.href) && (item.href === '/' ? pathname.length === 1 : true));
        const initialId = currentItem ? currentItem.id : 1;
        setActiveId(initialId);
        
        const position = `${(initialId - 1) * 25 + 12.5}%`;
        const initialColor = currentItem?.color || '#1E3A8A';

        gsap.set("#bgBubble", { left: position, backgroundColor: initialColor });
        gsap.set("#bg", { backgroundColor: initialColor });
        
        gsap.set(".bubble", { y: "120%", boxShadow: 'none' });
        gsap.set(".icon", { opacity: 0 });

        gsap.to(`#bubble${initialId}`, { y: "0%", opacity: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', delay: 0.1 });
        gsap.to(`#bubble${initialId} .icon`, { opacity: 0.7, delay: 0.1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const move = (id: number, href: string, color: string, navigate = true) => {
        if (id === activeId) return;

        const position = `${(id - 1) * 25 + 12.5}%`;
        const previousId = activeId;
        setActiveId(id);

        const tl = gsap.timeline({
            onComplete: () => {
                 if(navigate) router.push(href);
            }
        });
        
        tl.to("#bgBubble", {duration: 0.2, bottom: "-30px", ease: "power2.in"}, 0)
          .to(`#bubble${previousId}`, {duration: 0.2, y: "120%", boxShadow: 'none', ease: "power2.in"}, 0)
          .to(`#bubble${previousId} .icon`, {duration: 0.1, opacity: 0, ease: "power2.in"}, 0)
          .to("#bgBubble", {duration: 0.3, left: position, ease: "elastic.out(1, 0.75)"}, 0.1)
          .to("#bg", {duration: 0.3, backgroundColor: color, ease: "power2.out"}, 0.1)
          .to("#bgBubble", {duration: 0.3, backgroundColor: color, ease: "power2.out"}, 0.1)
          .to("#bgBubble", {duration: 0.25, bottom: "-50px", ease: "power2.out"}, '-=0.25')
          .to(`#bubble${id}`, {duration: 0.3, y: "0%", opacity: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', ease: "elastic.out(1, 0.75)"}, '-=0.2')
          .to(`#bubble${id} .icon`, {duration: 0.2, opacity: 0.7, ease: "power2.out"}, '-=0.15');
        
    };

    return (
        <div className="md:hidden">
            <div ref={navbarRef} id="navbarContainer" className="fixed bottom-0 left-0 right-0 h-24 bg-transparent z-50 pointer-events-none">
                <div id="navbar" className="w-full h-16 bg-card absolute bottom-0 shadow-t-md pointer-events-auto">
                    <div id="bubbleWrapper" className="absolute flex justify-around w-full bottom-6">
                        {navItems.map(item => (
                            <div key={item.id} id={`bubble${item.id}`} className="bubble">
                                <span className="icon"><item.icon /></span>
                            </div>
                        ))}
                    </div>
                    <div id="menuWrapper" className="absolute w-full h-full flex justify-around">
                        {navItems.map(item => (
                            <div key={item.id} id={`menu${item.id}`} className="menuElement" onClick={() => move(item.id, item.href, item.color)}>
                                <item.icon />
                            </div>
                        ))}
                    </div>
                </div>
                <div id="bgWrapper">
                    <div id="bg"></div>
                    <div id="bgBubble"></div>
                </div>
            </div>

            <style jsx global>{`
                #navbarContainer {
                    overflow: hidden;
                }
                #navbar {
                    height: 64px;
                }
                #bubbleWrapper {
                    bottom: 24px;
                }
                .bubble {
                    background-color: hsl(var(--card));
                    color: hsl(var(--card-foreground));
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    z-index: 1;
                    transform: translateY(120%);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .icon {
                    opacity: 0;
                }
                #bgWrapper {
                    filter: url(#goo);
                    width: 100%;
                    height: 100px;
                    position: absolute;
                    bottom: 64px;
                    pointer-events: none;
                }
                #bg {
                    width: 120%;
                    height: 100%;
                    margin-left: -10%;
                }
                #bgBubble {
                    position: absolute;
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    bottom: -50px;
                    transform: translateX(-50%);
                }
                #menuWrapper {
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                }
                .menuElement {
                    color: hsl(var(--muted-foreground));
                    opacity: 0.8;
                    cursor: pointer;
                    flex-grow: 1;
                    text-align: center;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .menuElement:hover {
                    opacity: 1;
                    color: hsl(var(--primary));
                }
            `}</style>
            
            <svg width="0" height="0">
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -15" result="goo" />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                    </filter>
                </defs>
            </svg>
        </div>
    );
};

export default BubbleTabBar;
