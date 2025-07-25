
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
    const isInitialMount = useRef(true);

    useEffect(() => {
        const currentItem = navItems.find(item => item.href === pathname);
        const initialId = currentItem ? currentItem.id : 1;
        setActiveId(initialId);
        
        // Skip animation on initial render, but set initial position and color
        if (isInitialMount.current) {
            const position = `${(initialId - 1) * 25 + 12.5}%`;
            gsap.set("#bgBubble", { left: position, backgroundColor: currentItem?.color || '#1E3A8A' });
            gsap.set("#bg", { backgroundColor: currentItem?.color || '#1E3A8A' });
            gsap.set(`#bubble${initialId}`, { y: "0%", opacity: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'});
            gsap.set(`#bubble${initialId} > .icon`, { opacity: 0.7 });
            isInitialMount.current = false;
        }
    }, [pathname]);

    const move = (id: number, href: string, color: string) => {
        if (id === activeId) return;

        const position = `${(id - 1) * 25 + 12.5}%`;
        setActiveId(id);

        const tl = gsap.timeline();
        tl.to("#bgBubble", {duration: 0.15, bottom: "-30px", ease: "ease-out"}, 0)
          .to(".bubble", { duration: 0.1, y: "120%", boxShadow: 'none', ease: "ease-out" }, 0)
          .to(".icon", { duration: 0.05, opacity: 0, ease: "ease-out" }, 0)
          .to("#bgBubble", { duration: 0.2, left: position, ease: "ease-in-out" }, 0.1)
          .to("#bgBubble", { duration: 0.15, bottom: "-50px", ease: "ease-out" }, '-=0.2')
          .to(`#bubble${id}`, { duration: 0.15, y: "0%", opacity: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', ease: "ease-out" }, '-=0.1')
          .to(`#bubble${id} > .icon`, { duration: 0.15, opacity: 0.7, ease: "ease-out" }, '-=0.1')
          .to("#bg", { duration: 0.3, backgroundColor: color, ease: "ease-in-out" }, 0)
          .to("#bgBubble", { duration: 0.3, backgroundColor: color, ease: "ease-in-out" }, 0);
        
        setTimeout(() => router.push(href), 150);
    };

    return (
        <div className="md:hidden">
            <div ref={navbarRef} id="navbarContainer" className="fixed bottom-0 left-0 right-0 h-24 bg-background z-50">
                <div id="navbar" className="w-full h-16 bg-card absolute bottom-0 shadow-t-md">
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
                    transform: translateY(120%);
                }
                #bgWrapper {
                    filter: url(#goo);
                    width: 100%;
                    height: 100px;
                    position: absolute;
                    bottom: 64px;
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
