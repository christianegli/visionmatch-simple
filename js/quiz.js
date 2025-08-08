const { useState } = React;
        
        // SVG icon components with OptiQa styling
        const ChevronRight = ({ className }) => React.createElement('svg', { className, fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'm9 18 6-6-6-6' }));
        const ChevronLeft = ({ className }) => React.createElement('svg', { className, fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'm15 18-6-6 6-6' }));
        const Eye = ({ className }) => React.createElement('svg', { className, fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' }), React.createElement('circle', { cx: 12, cy: 12, r: 3 }));
        const Glasses = ({ className }) => React.createElement('svg', { className, fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, React.createElement('circle', { cx: 6, cy: 15, r: 4 }), React.createElement('circle', { cx: 18, cy: 15, r: 4 }), React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'm6 11-2-2 1.5-1.5a2 2 0 0 1 1.414-.586H8.5m6 0h1.586a2 2 0 0 1 1.414.586L19 9l-2 2M10 15h4' }));
        const Sun = ({ className }) => React.createElement('svg', { className, fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, React.createElement('circle', { cx: 12, cy: 12, r: 4 }), React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 6.34l-1.41-1.41M19.07 19.07l-1.41-1.41' }));
        const Sparkles = ({ className }) => React.createElement('svg', { className, fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z' }));
        const MapPin = ({ className }) => React.createElement('svg', { className, fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' }), React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M15 11a3 3 0 11-6 0 3 3 0 016 0z' }));
        const Clock = ({ className }) => React.createElement('svg', { className, fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, React.createElement('circle', { cx: 12, cy: 12, r: 10 }), React.createElement('polyline', { points: '12,6 12,12 16,14' }));
        const Phone = ({ className }) => React.createElement('svg', { className, fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' }));

        const GlassesFinderWizard = () => {
            const [currentStep, setCurrentStep] = useState(0);
            const [answers, setAnswers] = useState({});
            const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
            const [aiInsights, setAiInsights] = useState('');
            const [loadingProgress, setLoadingProgress] = useState(0);
            const [showSectionComplete, setShowSectionComplete] = useState(false);
            const [completedSectionData, setCompletedSectionData] = useState(null);
            const [hasBookedExam, setHasBookedExam] = useState(false);
            const [selectedSlot, setSelectedSlot] = useState(null);
            const [selectedDate, setSelectedDate] = useState(null);
            const [availableTimes, setAvailableTimes] = useState([]);
            const [userZipCode, setUserZipCode] = useState('');
            const [showAllBrands, setShowAllBrands] = useState(false);

            const questions = [
                {
                    type: 'intro',
                    section: "Professional Vision Assessment",
                    title: "Your perfect eyewear setup",
                    subtitle: "A comprehensive vision assessment to determine your optimal eyewear solution based on your lifestyle and visual needs.",
                    note: "Professional optical analysis • Takes 2-3 minutes • Personalized recommendations"
                },
                {
                    type: 'single',
                    section: "Your Current Setup",
                    question: "Do you currently wear glasses or lenses?",
                    options: ["Yes, I wear glasses", "Yes, I wear both glasses and contact lenses", "No, but I think I need them", "No, and I don't think I need them"]
                },
                {
                    type: 'single',
                    section: "Your Current Setup",
                    question: "How many pairs of glasses do you regularly use?",
                    options: ["Just one", "Two", "More than two"],
                    conditional: (answers) => answers[1] && answers[1].includes('glasses')
                },
                {
                    type: 'multiple',
                    section: "Your Current Setup",
                    question: "What do you mostly use your glasses for?",
                    options: ["Everyday wear", "Screen/office work", "Driving", "Sports or outdoors", "Reading", "Fashion"],
                    conditional: (answers) => answers[1] && answers[1].includes('Yes')
                },
                {
                    type: 'single',
                    section: "Your Current Setup",
                    question: "Are you happy with your current setup?",
                    options: ["Not at all 😕", "Could be better 😐", "Pretty happy 🙂", "Love it 😍"],
                    conditional: (answers) => answers[1] && answers[1].includes('Yes')
                },
                {
                    type: 'brand-selector',
                    section: "Your Current Setup",
                    question: "Which brands do you like?",
                    popularBrands: ["Ray-Ban", "Oakley", "Lindberg", "Tom Ford", "Oliver Peoples", "Silhouette"],
                    allBrands: {
                        "Luxury & Designer": ["Tom Ford", "Oliver Peoples", "Cartier", "Chanel", "Dior", "Prada", "Gucci", "Saint Laurent", "Bottega Veneta", "Fendi", "Versace", "Emporio Armani"],
                        "Sport & Active": ["Oakley", "Nike", "Adidas", "Under Armour", "Revo", "Maui Jim", "Smith", "Julbo", "Bollé", "Uvex", "Carrera", "Police"],
                        "European Heritage": ["Ray-Ban", "Persol", "Lindberg", "Silhouette", "Anglo American", "Cazal", "Moscot", "Rodenstock", "Menrad", "Eschenbach"],
                        "Boutique": ["Ace & Tate", "Cubitts", "Mykita", "ic! berlin", "Etnia Barcelona", "Modo", "Garrett Leight", "Kirk & Kirk", "Theo", "L.A. Eyeworks", "Dita"],
                        "Spanish Chains & Online": ["Alain Afflelou", "Multiópticas", "General Óptica", "Óptica 2000", "Cottet", "Óptica Universitaria", "Visionlab", "Mister Spex España"],
                        "Lens Technology": ["Zeiss", "Essilor", "Transitions", "Crizal", "Varilux", "Blue Light Blocking", "Progressive Specialists", "Photochromic Lenses"]
                    },
                    genericOptions: ["I go for comfort over brands", "I prefer local/independent opticians", "Not sure / no preference"],
                    conditional: (answers) => answers[1] && answers[1].includes('glasses')
                },
                {
                    type: 'single',
                    section: "Lens Comfort & Eye Experience",
                    question: "Do you think you would benefit from a new pair of glasses/lenses?",
                    options: ["Yes, definitely", "Maybe, I'm not sure", "Probably not", "No, I'm satisfied"]
                },
                {
                    type: 'single',
                    section: "Lens Comfort & Eye Experience",
                    question: "Have your lenses been updated in the past 2 years?",
                    options: ["Yes", "No", "Not sure"],
                    conditional: (answers) => answers[1] && answers[1].includes('glasses')
                },
                {
                    type: 'multiple',
                    section: "Lens Comfort & Eye Experience",
                    question: "Do you ever experience any of the following?",
                    options: ["Headaches", "Tired eyes", "Glare sensitivity", "Eye strain at screen", "None of these"]
                },
                {
                    type: 'single',
                    section: "Lens Comfort & Eye Experience",
                    question: "What type of lenses do you have today?",
                    options: ["Single vision", "Progressive (multifocal)", "Not sure"],
                    conditional: (answers) => answers[1] && answers[1].includes('glasses')
                },
                {
                    type: 'single',
                    section: "Lens Comfort & Eye Experience",
                    question: "How many hours per day are you in front of a screen?",
                    options: ["<2 hours", "2–4 hours", "5–8 hours", "More than 8 hours"]
                },
                {
                    type: 'single',
                    section: "Lifestyle & Vision Needs",
                    question: "Do you have issues with your current glasses while driving?",
                    options: ["No", "Yes", "Yes, but only at night", "I don't drive a lot"],
                    conditional: (answers) => {
                        const wearsGlasses = answers[1] && answers[1].includes('Yes');
                        const useForDriving = answers[3] && answers[3].includes('Driving');
                        return wearsGlasses && useForDriving;
                    }
                },
                {
                    type: 'multiple',
                    section: "Lifestyle & Vision Needs",
                    question: "What do you usually do in your free time?",
                    options: ["Exercise or play sports", "Read/watch shows", "Spend time outdoors", "Travel", "Create (music, art, crafts)", "None of these"]
                },
                {
                    type: 'single',
                    section: "Lifestyle & Vision Needs",
                    question: "Do you ever avoid wearing glasses because they get in the way of your activities?",
                    options: ["Yes", "Sometimes", "No"],
                    conditional: (answers) => {
                        const wearsGlasses = answers[1] && answers[1].includes('Yes');
                        const uses = answers[3] || [];
                        const freeTime = answers[12] || [];
                        const doesSports = uses.includes("Sports or outdoors") || freeTime.includes("Exercise or play sports") || freeTime.includes("Spend time outdoors");
                        return wearsGlasses && doesSports;
                    }
                },
                {
                    type: 'text',
                    section: "Lifestyle & Vision Needs",
                    question: "Tell us about your specific activities and hobbies",
                    placeholder: "e.g., tennis twice a week, coding 8+ hours daily, reading novels, cycling, gaming, cooking, woodworking, etc.",
                    conditional: (answers) => {
                        const freeTime = answers[12] || [];
                        return freeTime.length > 0 && !freeTime.includes("None of these");
                    }
                },
                {
                    type: 'single',
                    section: "Sun, Style & Self-Expression",
                    question: "Do you wear sunglasses with prescription?",
                    options: ["Yes", "No, but I'd like to", "No"]
                },
                {
                    type: 'slider',
                    section: "Sun, Style & Self-Expression",
                    question: "What is important for you in glasses?",
                    sliderLabels: ["Price", "Style"],
                    sliderDefault: 50
                }
            ];

            const downloadResultsAsPDF = () => {
                try {
                    const content = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h1 style="color: #3b82f6; text-align: center; margin-bottom: 30px;">Your Personalized Vision Plan</h1>
                            
                            <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                                <h2 style="color: #1f2937; margin-bottom: 15px;">📊 Your Answers Summary</h2>
                                ${Object.entries(answers).map(([key, value]) => {
                                    const question = questions[parseInt(key)];
                                    if (!question) return '';
                                    return `<p><strong>${question.question}</strong><br/>${Array.isArray(value) ? value.join(', ') : value}</p>`;
                                }).join('')}
                            </div>
                            
                            <div style="background: #eff6ff; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                                <h2 style="color: #1f2937; margin-bottom: 15px;">🧠 AI-Powered Insights</h2>
                                <div>${aiInsights.replace(/\n/g, '<br/>')}</div>
                            </div>
                            
                            <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280;">
                                <p>Generated by OptiQa Vision Finder • ${new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    `;

                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                        printWindow.document.write(`
                            <html>
                                <head><title>Your Vision Plan</title></head>
                                <body>${content}</body>
                            </html>
                        `);
                        printWindow.document.close();
                        printWindow.print();
                    }
                } catch (error) {
                    alert('Download failed. Please try again or take a screenshot of your results.');
                }
            };

            const generateAIInsights = async () => {
                setIsGeneratingInsights(true);
                setLoadingProgress(0);
                
                const progressInterval = setInterval(() => {
                    setLoadingProgress(prev => {
                        if (prev >= 95) {
                            clearInterval(progressInterval);
                            return 95;
                        }
                        return prev + Math.random() * 15;
                    });
                }, 200);

                const timeoutId = setTimeout(() => {
                    console.log("AI request timed out, using fallback");
                    clearInterval(progressInterval);
                    setLoadingProgress(100);
                    setTimeout(() => {
                        setAiInsights(generatePersonalizedFallback());
                        setIsGeneratingInsights(false);
                    }, 500);
                }, 8000); // Increased timeout for retries
                
                const tryGeminiAPI = async (model, retryCount = 0) => {
                    try {
                        console.log(`🤖 Trying ${model} (attempt ${retryCount + 1})...`);
                        
                        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=AIzaSyBwPLk8BhFMmAMWSAlKC3DOgPMNqL6BJXA`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                contents: [{
                                    parts: [{
                                        text: `You're a friendly vision expert helping someone find the perfect glasses for their lifestyle. Based on their questionnaire, give personalized, practical advice.\n\nTheir answers: ${JSON.stringify(answers, null, 2)}\n\nANALYSIS FRAMEWORK:\n1. Screen Time Analysis: Look at hours per day, eye strain symptoms, work type\n2. Activity Analysis: Parse their specific activities text and lifestyle needs  \n3. Current Setup Analysis: What they have vs satisfaction level vs needs\n4. Vision Type Analysis: Progressive vs single vision impacts recommendations\n5. Lifestyle Gaps: What's missing from their current setup\n\nRECOMMENDATION RULES:\n- 5+ hours screen time + eye strain = dedicated computer glasses recommended\n- Sports activities mentioned = sports glasses (be specific to their sport)\n- Progressive lenses + lots of reading = separate reading glasses for comfort\n- Driving issues = specialized driving glasses with anti-glare\n- Outdoor activities = prescription sunglasses essential\n- "Avoid wearing glasses" = contact lens alternative or sports glasses\n- Unhappy with current setup = identify specific problems and solutions\n\nMANDATORY: You MUST recommend exactly 3 pairs of glasses. No more, no less. Always 3 pairs.\n\nMake sure that your output is a digestible recommendation for the end consumer. Dont include your thought process. If a user skips a question, dont specifically mention that, but interpret what it might mean or ignore that part. Dont mention brands or models. Don't be overly generic, don't suggest "lightweight frames" etc. Try to be specific and personal and make it relevant for the user.\n\nStructure your response like this:\n\n**Your Vision Analysis:** [2 sentences: their main challenges and lifestyle demands based on actual answers]\n\n**Recommended Eyewear System:** (Exactly 3 glasses required)\n**• For every day use:** [Primary glasses - be specific about lens type, coatings, frame style for their main need]\n**• For [specific activities, hobbies, sports etc.]:** [Secondary glasses - match to their specific secondary activity/need]\n**• For [an additional use case based on their answers]:** [Third glasses - always provide a third recommendation, could be backup, specialized, or complementary pair]\n\n**Why This Setup:** [Explain how each recommendation solves specific problems they mentioned]\n\n**Activity-Specific Tips:** [Based on their activities text, give 2-3 specific tips for their hobbies/work]\n\nCRITICAL: You must provide exactly 3 glasses recommendations every time. Vary recommendations based on their actual answers. Make it personal and specific. ALWAYS EXACTLY 3 GLASSES.`
                                    }]
                                }]
                            })
                        });
                        
                        if (!response.ok) {
                            const errorText = await response.text();
                            throw new Error(`${response.status}: ${errorText}`);
                        }
                        
                        const data = await response.json();
                        console.log(`✅ ${model} success!`, data);
                        
                        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
                            return data.candidates[0].content.parts[0].text;
                        } else {
                            throw new Error('Invalid response format');
                        }
                        
                    } catch (error) {
                        console.log(`❌ ${model} failed (attempt ${retryCount + 1}):`, error.message);
                        
                        // If it's a 503 overload error and we have retries left
                        if (error.message.includes('503') && retryCount < 2) {
                            const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
                            console.log(`⏳ Retrying ${model} in ${delay}ms...`);
                            await new Promise(resolve => setTimeout(resolve, delay));
                            return tryGeminiAPI(model, retryCount + 1);
                        }
                        
                        throw error;
                    }
                };
                
                try {
                    console.log("🤖 Starting Gemini AI analysis...");
                    console.log("User answers:", answers);
                    
                    let result;
                    
                    // Try Flash model first (faster)
                    try {
                        result = await tryGeminiAPI('gemini-1.5-flash');
                    } catch (flashError) {
                        console.log("🔄 Flash model failed, trying Pro model...");
                        // Fallback to Pro model if Flash is overloaded
                        result = await tryGeminiAPI('gemini-1.5-pro');
                    }
                    
                    clearTimeout(timeoutId);
                    clearInterval(progressInterval);
                    setLoadingProgress(100);
                    
                    setTimeout(() => {
                        setAiInsights(result);
                        setIsGeneratingInsights(false);
                        console.log("🎉 Real AI insights generated!");
                    }, 500);
                    
                } catch (error) {
                    clearTimeout(timeoutId);
                    clearInterval(progressInterval);
                    console.log("🔄 Both AI models failed, using intelligent fallback:", error.message);
                    setLoadingProgress(100);
                    
                    setTimeout(() => {
                        setAiInsights(generatePersonalizedFallback());
                        setIsGeneratingInsights(false);
                        console.log("✅ Smart recommendations generated from your answers!");
                    }, 1000);
                }
            };

            const generatePersonalizedFallback = () => {
                const screenTime = Object.values(answers).find(a => 
                    typeof a === 'string' && (a.includes('8 hours') || a.includes('More than 8'))
                );
                const hasEyeStrain = Object.values(answers).some(a => 
                    Array.isArray(a) && a.includes('Eye strain at screen')
                );
                const hasProgressives = Object.values(answers).some(a => 
                    typeof a === 'string' && a.includes('Progressive')
                );
                const activitiesText = Object.values(answers).find(a => 
                    typeof a === 'string' && a.length > 10 && !a.includes('hours') && !a.includes('Progressive')
                );
                const isActiveUser = Object.values(answers).some(a => 
                    Array.isArray(a) && (a.includes('Exercise or play sports') || a.includes('Spend time outdoors'))
                );

                let analysis = "Based on your responses, you have diverse visual needs throughout your day that would benefit from a strategic multi-glasses approach.";
                let primary = "**Primary:** Daily wear glasses with anti-reflective coating and premium lenses";
                let secondary = "**Secondary:** Prescription sunglasses with UV protection and polarized lenses";
                let third = "**Third:** Backup glasses or specialized computer lenses";

                if (screenTime && hasEyeStrain) {
                    analysis = "Your extensive screen time combined with eye strain symptoms indicates you need specialized solutions for digital comfort and general vision needs.";
                    primary = "**Primary:** Computer glasses with blue light filtering and anti-reflective coating - optimized for your extensive screen work";
                    third = "**Third:** General-purpose everyday glasses for non-screen activities";
                }

                if (hasProgressives) {
                    primary = "**Primary:** Progressive lenses with premium coatings - seamless vision at all distances";
                    third = "**Third:** Dedicated reading glasses for extended close-up work and enhanced comfort";
                }

                if (activitiesText && activitiesText.length > 20) {
                    if (activitiesText.toLowerCase().includes('sport') || activitiesText.toLowerCase().includes('tennis') || activitiesText.toLowerCase().includes('cycling')) {
                        secondary = "**Secondary:** Sport-specific glasses with impact-resistant lenses and secure fit - perfect for your active lifestyle";
                    }
                    if (activitiesText.toLowerCase().includes('driving') || activitiesText.toLowerCase().includes('night')) {
                        third = "**Third:** Specialized driving glasses with anti-glare coating for enhanced night vision safety";
                    }
                }

                return `**Your Vision Analysis:** ${analysis} Your questionnaire responses show specific patterns that guide us toward a personalized three-glasses system.\n\n**Recommended Eyewear System:**\n• ${primary}\n• ${secondary}\n• ${third}\n\n**Why This Setup:** This three-glasses approach ensures optimal vision for your specific lifestyle demands. Each pair addresses different visual environments and activities, providing comprehensive coverage for work, leisure, and daily life.\n\n**Activity-Specific Tips:** Keep your most-used glasses easily accessible in your daily routine. Consider lens cleaning kits for each pair to maintain optimal clarity. Schedule regular eye exams to keep prescriptions current and adjust recommendations as your needs evolve.`;
            };

            const bookExamSlot = (slot) => {
                setSelectedSlot(slot);
                setHasBookedExam(true);
            };

            const renderBookingCalendar = () => {
                const today = new Date();

                const generateCalendarDays = () => {
                    const days = [];
                    let currentDate = new Date(today);
                    currentDate.setDate(today.getDate() + 1);
                    
                    while (days.length < 10) {
                        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
                            days.push(new Date(currentDate));
                        }
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                    return days;
                };

                const generateTimeSlotsForDate = (date) => {
                    const times = [];
                    const startHour = 9;
                    const endHour = 17;
                    
                    for (let hour = startHour; hour <= endHour; hour++) {
                        if (hour === 13) continue;
                        
                        const time = new Date(date);
                        time.setHours(hour, 0, 0, 0);
                        
                        const isBooked = Math.random() < 0.3;
                        
                        times.push({
                            time: time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
                            datetime: time,
                            isBooked
                        });
                    }
                    return times;
                };

                const calendarDays = generateCalendarDays();

                const handleDateSelect = (date) => {
                    setSelectedDate(date);
                    setAvailableTimes(generateTimeSlotsForDate(date));
                };

                const selectTimeSlot = (time) => {
                    const slot = {
                        date: selectedDate?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                        time: time.time,
                        datetime: time.datetime
                    };
                    bookExamSlot(slot);
                };
                
                return React.createElement('div', { className: "space-y-6" },
                    React.createElement('div', { className: "text-center" },
                        React.createElement('h3', { className: "text-2xl font-bold text-gray-800 mb-4" }, "📅 Book Your Eye Exam"),
                        React.createElement('p', { className: "text-gray-600 mb-6" },
                            "Schedule a comprehensive eye exam to get personalized recommendations from our certified opticians."
                        )
                    ),

                    React.createElement('div', { className: "bg-white rounded-xl p-6 border border-gray-200 shadow-sm" },
                        React.createElement('h4', { className: "text-lg font-semibold text-gray-800 mb-4" }, "1. Enter Your Zip Code"),
                        React.createElement('div', { className: "max-w-md" },
                            React.createElement('input', {
                                type: "text",
                                value: userZipCode,
                                onChange: (e) => setUserZipCode(e.target.value.replace(/\D/g, '').slice(0, 5)),
                                placeholder: "Enter zip code (e.g., 28001)",
                                className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg",
                                maxLength: 5
                            }),
                            React.createElement('p', { className: "text-sm text-gray-500 mt-2" }, "We'll find the closest certified opticians in your area")
                        )
                    ),

                    userZipCode.length >= 5 && React.createElement('div', { className: "bg-white rounded-xl p-6 border border-gray-200 shadow-sm" },
                        React.createElement('h4', { className: "text-lg font-semibold text-gray-800 mb-4" }, "2. Select a Date"),
                        React.createElement('div', { className: "grid grid-cols-5 gap-3" },
                            calendarDays.map((day, index) =>
                                React.createElement('button', {
                                    key: index,
                                    onClick: () => handleDateSelect(day),
                                    className: `p-3 border rounded-lg text-center transition-all hover:border-blue-400 ${
                                        selectedDate?.toDateString() === day.toDateString()
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 hover:bg-gray-50'
                                    }`
                                },
                                    React.createElement('div', { className: "text-xs text-gray-500 font-medium" },
                                        day.toLocaleDateString('en-US', { weekday: 'short' })
                                    ),
                                    React.createElement('div', { className: "text-lg font-semibold" },
                                        day.getDate()
                                    ),
                                    React.createElement('div', { className: "text-xs text-gray-500" },
                                        day.toLocaleDateString('en-US', { month: 'short' })
                                    )
                                )
                            )
                        )
                    ),

                    selectedDate && userZipCode.length >= 5 && React.createElement('div', { className: "bg-white rounded-xl p-6 border border-gray-200 shadow-sm" },
                        React.createElement('h4', { className: "text-lg font-semibold text-gray-800 mb-4" },
                            `3. Choose a Time for ${selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
                        ),
                        React.createElement('div', { className: "grid grid-cols-3 md:grid-cols-4 gap-3" },
                            availableTimes.map((timeSlot, index) =>
                                React.createElement('button', {
                                    key: index,
                                    onClick: () => selectTimeSlot(timeSlot),
                                    disabled: timeSlot.isBooked,
                                    className: `p-3 rounded-lg font-medium transition-all ${
                                        timeSlot.isBooked
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                            : 'border border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-400'
                                    }`
                                },
                                    timeSlot.isBooked ? 
                                        React.createElement('div', { className: "flex flex-col items-center" },
                                            React.createElement('span', { className: "text-sm" }, timeSlot.time),
                                            React.createElement('span', { className: "text-xs" }, "Booked")
                                        ) : 
                                        timeSlot.time
                                )
                            )
                        )
                    ),

                    React.createElement('div', { className: "text-center text-sm text-gray-500" },
                        React.createElement('p', null, "💡 All exams include comprehensive vision testing and personalized glasses recommendations")
                    )
                );
            };

            const renderOpticiansList = () => {
                const mockStores = [
                    {
                        name: "Optica Nova", 
                        distance: "550m", 
                        specialty: "Fast service & great progressive lens fittings", 
                        phone: "+34 912 345 678",
                        address: "Calle Gran Via 45, Madrid",
                    },
                    {
                        name: "CentroVisión", 
                        distance: "1.1km", 
                        specialty: "Specialists in sports and sunglasses", 
                        phone: "+34 912 345 679",
                        address: "Plaza Mayor 12, Madrid", 
                    },
                    {
                        name: "Óptica Bassol", 
                        distance: "2.3km", 
                        specialty: "Premium frames & lens upgrade support", 
                        phone: "+34 912 345 680",
                        address: "Paseo de la Castellana 89, Madrid",
                    }
                ];

                return React.createElement('div', { className: "space-y-6" },
                    React.createElement('div', { className: "bg-green-50 rounded-xl p-4 border border-green-200" },
                        React.createElement('div', { className: "flex items-center space-x-3" },
                            React.createElement('div', { className: "w-10 h-10 bg-green-500 rounded-full flex items-center justify-center" },
                                React.createElement('svg', { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
                                    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" })
                                )
                            ),
                            React.createElement('div', null,
                                React.createElement('h4', { className: "font-semibold text-green-800" }, "Exam Booked Successfully!"),
                                React.createElement('p', { className: "text-sm text-green-700" },
                                    `${selectedSlot?.date} at ${selectedSlot?.time} in ${userZipCode} - Confirmation details sent to your email`
                                )
                            )
                        )
                    ),

                    React.createElement('div', { className: "bg-white rounded-2xl p-6 border border-gray-200 shadow-lg" },
                        React.createElement('h3', { className: "text-xl font-semibold text-gray-800 mb-4 flex items-center" },
                            React.createElement(MapPin, { className: "w-5 h-5 mr-2 text-blue-600" }),
                            "Your Closest Certified Opticians"
                        ),
                        React.createElement('div', { className: "space-y-4" },
                            mockStores.map((store, index) =>
                                React.createElement('div', { key: index, className: "p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-300 transition-colors" },
                                    React.createElement('div', { className: "flex justify-between items-start mb-2" },
                                        React.createElement('h4', { className: "font-semibold text-gray-800" }, store.name),
                                        React.createElement('span', { className: "text-sm text-gray-500 bg-white px-2 py-1 rounded-full" }, store.distance)
                                    ),
                                    React.createElement('p', { className: "text-gray-600 text-sm mb-1" }, store.specialty),
                                    React.createElement('p', { className: "text-gray-500 text-xs mb-3" }, store.address),
                                    React.createElement('div', { className: "flex space-x-3" },
                                        React.createElement('button', { className: "flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors" },
                                            "Get Directions"
                                        ),
                                        React.createElement('button', { className: "flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors" },
                                            React.createElement(Phone, { className: "w-4 h-4" })
                                        )
                                    )
                                )
                            )
                        )
                    ),

                    React.createElement('div', { className: "bg-white rounded-2xl p-6 border border-gray-200 shadow-lg" },
                        React.createElement('h3', { className: "text-xl font-semibold text-gray-800 mb-4" }, "📍 Store Locations Map"),
                        React.createElement('div', { 
                            id: "opticians-map", 
                            className: "rounded-lg h-80 border border-gray-300",
                            style: { minHeight: "320px" }
                        }),
                        
                        React.createElement('div', { className: "mt-4 bg-gray-50 rounded-lg p-4" },
                            React.createElement('div', { className: "flex items-center justify-between mb-3" },
                                React.createElement('h5', { className: "font-semibold text-gray-800" }, "Nearby Locations"),
                                React.createElement('span', { className: "text-sm text-gray-500" }, `Based on zip code: ${userZipCode || 'Not provided'}`)
                            ),
                            React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                                mockStores.map((store, index) =>
                                    React.createElement('div', { key: index, className: "flex items-center space-x-3" },
                                        React.createElement('div', { 
                                            className: `w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                                index === 0 ? 'bg-red-500' : index === 1 ? 'bg-blue-500' : 'bg-green-500'
                                            }`
                                        }, index + 1),
                                        React.createElement('div', null,
                                            React.createElement('div', { className: "font-medium text-gray-800 text-sm" }, store.name),
                                            React.createElement('div', { className: "text-gray-500 text-xs" }, store.distance + " away")
                                        )
                                    )
                                )
                            )
                        )
                    )
                );
            };

            const updateAnswer = (questionNum, value) => {
                setAnswers(prev => ({
                    ...prev,
                    [questionNum]: value
                }));
            };

            const isAnswered = () => {
                if (currentStep === 0) return true;
                if (currentStep >= questions.length) return true;
                
                const answer = answers[currentStep];
                const question = questions[currentStep];
                
                if (question?.type === 'multiple' || question?.type === 'brand-selector') {
                    return Array.isArray(answer) && answer.length > 0;
                }
                
                if (question?.type === 'slider') {
                    return true;
                }
                
                if (question?.type === 'text') {
                    return true;
                }
                
                return answer !== undefined && answer !== null && answer !== '';
            };

            const getProgress = () => {
                const totalEffective = questions.filter((q, index) => index > 0 && (!q.conditional || q.conditional(answers) || answers[index] !== undefined)).length;
                const completedSteps = Object.keys(answers).filter(key => parseInt(key) > 0 && parseInt(key) <= currentStep).length;
                return (completedSteps / totalEffective) * 100;
            };

            const getSectionProgress = () => {
                const sections = [
                    { name: "Your Current Setup", start: 1, end: 5 },
                    { name: "Lens Comfort & Eye Experience", start: 6, end: 10 },
                    { name: "Lifestyle & Vision Needs", start: 11, end: 14 },
                    { name: "Sun, Style & Self-Expression", start: 15, end: 16 }
                ];

                return sections.map((section) => {
                    let progress = 0;
                    if (currentStep < section.start) {
                        progress = 0;
                    } else if (currentStep > section.end) {
                        progress = 100;
                    } else {
                        const sectionProgress = (currentStep - section.start + 1) / (section.end - section.start + 1);
                        progress = sectionProgress * 100;
                    }
                    
                    return {
                        ...section,
                        progress,
                        isActive: currentStep >= section.start && currentStep <= section.end,
                        isComplete: currentStep > section.end
                    };
                });
            };

            const getSectionColor = (section) => {
                switch (section) {
                    case "Professional Vision Assessment": return "optiqa-gradient";
                    case "Your Current Setup": return "optiqa-gradient";
                    case "Lens Comfort & Eye Experience": return "optiqa-gradient";
                    case "Lifestyle & Vision Needs": return "optiqa-gradient";
                    case "Sun, Style & Self-Expression": return "optiqa-gradient";
                    default: return "optiqa-gradient";
                }
            };

            const getSectionIcon = (section) => {
                switch (section) {
                    case "Let's Get Started": return Sparkles;
                    case "Your Current Setup": return Glasses;
                    case "Lens Comfort & Eye Experience": return Eye;
                    case "Lifestyle & Vision Needs": return Clock;
                    case "Sun, Style & Self-Expression": return Sun;
                    default: return Sparkles;
                }
            };

            const getSectionInsights = (sectionName, answers) => {
                const generateDynamicInsight = (section) => {
                    // Helper function to find answer by question text
                    const findAnswerByQuestion = (questionText) => {
                        const questionIndex = questions.findIndex(q => q.question && q.question.includes(questionText));
                        return questionIndex !== -1 ? answers[questionIndex] : null;
                    };
                    
                    // Dynamic insights based on user responses
                    
                    switch(section) {
                        case "Your Current Setup":
                            // Find answers by question content instead of hardcoded indices
                            const wearsGlasses = findAnswerByQuestion('Do you currently wear glasses or lenses?');
                            const glassesCount = findAnswerByQuestion('How many pairs of glasses do you regularly use?');
                            const satisfaction = findAnswerByQuestion('Are you happy with your current setup?');
                            const glassesUse = findAnswerByQuestion('What do you mostly use your glasses for?') || [];
                            

                            
                            // New user insights
                            if (!wearsGlasses || (!wearsGlasses.includes('glasses') && !wearsGlasses.includes('both'))) {
                                const contactsOnly = wearsGlasses && wearsGlasses.includes('contacts');
                                if (contactsOnly) {
                                    return "👁️ Contacts-only users often discover glasses as their secret weapon for eye comfort and style versatility!";
                                }
                                return "🌟 Perfect timing! Many people avoid glasses until problems develop - you're being proactive about your vision health.";
                            }

                            // Experienced user insights with more variety
                            const veryHappy = satisfaction && satisfaction.includes("Very happy");
                            const notHappy = satisfaction && satisfaction.includes("Not at all");
                            const multipleUses = Array.isArray(glassesUse) && glassesUse.length >= 3;
                            const screenWork = Array.isArray(glassesUse) && glassesUse.includes("Screen/office work");
                            const driving = Array.isArray(glassesUse) && glassesUse.includes("Driving");
                            const reading = Array.isArray(glassesUse) && glassesUse.includes("Reading");
                            const sports = Array.isArray(glassesUse) && glassesUse.includes("Sports or outdoors");

                            if (notHappy && glassesCount === "Just one") {
                                return "🎯 Your frustration makes perfect sense - one pair trying to handle everything rarely works perfectly for any task!";
                            }
                            
                            if (veryHappy && glassesCount === "Just one") {
                                return "👏 Amazing that one pair works so well for you! Let's see if we can make your vision experience even better.";
                            }

                            if (glassesCount === "More than two" && veryHappy) {
                                return "🏆 You've discovered the vision optimization secret - multiple specialized pairs for peak performance!";
                            }

                            if (screenWork && driving && reading) {
                                return "📊 Screen + driving + reading? Your eyes work harder than most - specialized lenses for each activity can be life-changing!";
                            }
                            
                            if (sports && screenWork) {
                                return "⚡ Digital work AND active lifestyle? You need glasses that can keep up with your dynamic routine!";
                            }

                            if (multipleUses && glassesCount === "Just one") {
                                return "🔄 Your diverse activities deserve diverse optical solutions - it's like having one tool for every job!";
                            }

                            return "💎 Every vision setup is unique - let's optimize yours for maximum comfort and performance!";
                            
                        case "Lens Comfort & Eye Experience":
                            const screenTime = findAnswerByQuestion('How many hours per day are you in front of a screen?');
                            const symptoms = findAnswerByQuestion('Do you ever experience any of the following?') || [];
                            const lensType = findAnswerByQuestion('What type of lenses do you have today?');
                            const lensUpdated = findAnswerByQuestion('Have your lenses been updated in the past 2 years?');
                            

                            
                            // Enhanced symptom analysis
                            const hasEyeStrain = Array.isArray(symptoms) && symptoms.includes("Eye strain at screen");
                            const hasHeadaches = Array.isArray(symptoms) && symptoms.includes("Headaches");
                            const hasTiredEyes = Array.isArray(symptoms) && symptoms.includes("Tired eyes");
                            const hasDryEyes = Array.isArray(symptoms) && symptoms.includes("Dry eyes");
                            const hasBlurryVision = Array.isArray(symptoms) && symptoms.includes("Blurry vision");
                            const noSymptoms = Array.isArray(symptoms) && symptoms.includes("None of these");
                            const symptomCount = Array.isArray(symptoms) ? symptoms.filter(s => s !== "None of these").length : 0;

                            // Heavy screen users with multiple symptoms
                            if (screenTime === "More than 8 hours" && symptomCount >= 3) {
                                return "🚨 Multiple symptoms + 8+ hours screens = your eyes are working overtime! Blue light filtering and proper breaks can transform your day.";
                            }

                            // Progressive lens computer struggles
                            if (lensType === "Progressive (multifocal)" && hasEyeStrain && screenTime !== "Less than 2 hours") {
                                return "🖥️ Progressive lenses + computer work = neck strain and eye fatigue. Dedicated computer glasses are a game-changer!";
                            }

                            // Outdated prescription red flags
                            if (lensUpdated === "No" && (hasBlurryVision || hasHeadaches)) {
                                return "📅 Blurry vision or headaches with an old prescription? Your eyes are literally asking for an update!";
                            }

                            // Classic digital eye strain combo
                            if (hasEyeStrain && hasTiredEyes && screenTime !== "Less than 2 hours") {
                                return "💻 Eye strain + tired eyes = textbook digital fatigue. Anti-reflective coatings and blue light filters work wonders!";
                            }

                            // Dry eyes insight
                            if (hasDryEyes && screenTime === "More than 8 hours") {
                                return "💧 Extended screen time reduces your blink rate by 60%! Specialized lens coatings can help maintain eye moisture.";
                            }

                            // Headache analysis
                            if (hasHeadaches && !hasEyeStrain && lensType !== "I don't wear glasses") {
                                return "🧠 Headaches without eye strain often mean your prescription needs fine-tuning - small changes, big relief!";
                            }

                            // No symptoms celebration with variety
                            if (noSymptoms && screenTime === "More than 8 hours") {
                                return "🎉 No eye symptoms despite heavy screen use? You've got excellent visual stamina - let's keep it that way!";
                            }
                            if (noSymptoms) {
                                return "✨ Symptom-free vision is a gift! Our goal is to optimize what's already working well for you.";
                            }

                            // Moderate users
                            if (screenTime === "4-6 hours" && symptomCount === 1) {
                                return "⚖️ One symptom with moderate screen time? Catching issues early prevents them from becoming chronic problems.";
                            }

                            return "🔍 Your symptom pattern reveals exactly where we can optimize your visual comfort - precision solutions ahead!";
                            
                        case "Lifestyle & Vision Needs":
                            const freeTime = findAnswerByQuestion('What do you usually do in your free time?') || [];
                            const drivingIssues = findAnswerByQuestion('Do you have issues with your current glasses while driving?');
                            const avoidGlasses = findAnswerByQuestion('Do you ever avoid wearing glasses because they get in the way?');
                            const activities = findAnswerByQuestion('Tell us about your specific activities and hobbies');
                            

                            
                            // Detailed activity analysis
                            const doesSports = Array.isArray(freeTime) && freeTime.includes("Exercise or play sports");
                            const doesOutdoors = Array.isArray(freeTime) && freeTime.includes("Spend time outdoors");
                            const doesReading = Array.isArray(freeTime) && freeTime.includes("Read/watch shows");
                            const doesCreative = Array.isArray(freeTime) && freeTime.includes("Create (music, art, crafts)");
                            const doesTravel = Array.isArray(freeTime) && freeTime.includes("Travel");
                            const doesSocial = Array.isArray(freeTime) && freeTime.includes("Socialize with friends/family");
                            const activityCount = Array.isArray(freeTime) ? freeTime.length : 0;

                            // Sports + avoids glasses = major insight
                            if (doesSports && avoidGlasses === "Yes") {
                                return "⚡ Avoiding glasses during sports? You're missing out on enhanced performance, safety, and confidence - sport-specific eyewear changes everything!";
                            }

                            // Night driving struggles
                            if (drivingIssues && drivingIssues.includes("Yes, but only at night")) {
                                return "🌙 Night driving troubles are incredibly common! Anti-reflective coatings reduce glare by up to 99% - like turning on high-def vision.";
                            }

                            // All driving issues
                            if (drivingIssues && drivingIssues.includes("Yes, all the time")) {
                                return "🚗 Constant driving issues suggest your current glasses aren't optimized for distance vision - time for driving-specific lenses!";
                            }

                            // Creative + reading combo
                            if (doesCreative && doesReading) {
                                return "🎨 Art + reading = your eyes constantly shift between detail work and relaxed viewing. Progressive lenses or task-specific pairs are perfect!";
                            }

                            // Outdoor enthusiasts
                            if (doesOutdoors && doesSports) {
                                return "🏞️ Outdoor sports combo? UV protection and impact resistance aren't just nice-to-have - they're essential for your active lifestyle!";
                            }

                            // Travel insights
                            if (doesTravel && activityCount >= 3) {
                                return "✈️ Multi-activity traveler detected! Versatile photochromic lenses adapt to any destination - from beach to mountain to city.";
                            }

                            // Social butterflies
                            if (doesSocial && avoidGlasses === "Yes") {
                                return "👥 Social person who avoids glasses? The right frames actually enhance your confidence and become a style statement!";
                            }

                            // Highly active people
                            if (activityCount >= 4) {
                                return "🎯 Wow, you're incredibly active! Your diverse lifestyle deserves equally diverse optical solutions - each activity has unique visual demands.";
                            }

                            // Detailed activity descriptions
                            if (activities && activities.length > 100) {
                                return "📝 Your detailed activity description shows how much vision matters to your life - let's make sure it's optimized for everything you love!";
                            }

                            // Low-key lifestyle
                            if (activityCount <= 2 && doesReading) {
                                return "📚 Focused lifestyle with reading emphasis? Comfort lenses with blue light filtering and anti-fatigue features are your best friends.";
                            }

                            return "🌟 Your unique lifestyle pattern is exactly what we need to create the perfect vision solution - no generic recommendations here!";
                            
                                                case "Sun, Style & Self-Expression":
                            const prescriptionSunglasses = findAnswerByQuestion('Do you wear sunglasses with prescription?');
                            const stylePreference = findAnswerByQuestion('What is important for you in glasses?');
                            const brandPreference = findAnswerByQuestion('Do you prefer specific brands or styles?') || [];
                            
 
                            
                            // Enhanced style and sun protection analysis
                            const wantsRxSunglasses = prescriptionSunglasses === "No, but I'd like to";
                            const hasRxSunglasses = prescriptionSunglasses === "Yes";
                            const noRxSunglasses = prescriptionSunglasses === "No";
                            const styleImportant = Array.isArray(stylePreference) && stylePreference.includes("Style and looks");
                            const comfortImportant = Array.isArray(stylePreference) && stylePreference.includes("Comfort");
                            const durabilityImportant = Array.isArray(stylePreference) && stylePreference.includes("Durability");
                            const priceImportant = Array.isArray(stylePreference) && stylePreference.includes("Price/value");
                            const hasLuxuryBrands = Array.isArray(brandPreference) && (brandPreference.includes("Dita") || brandPreference.includes("Lindberg") || brandPreference.includes("Silhouette"));
                            const hasAccessibleBrands = Array.isArray(brandPreference) && (brandPreference.includes("General Óptica") || brandPreference.includes("Multiópticas"));

                            // Prescription sunglasses insights
                            if (wantsRxSunglasses && styleImportant) {
                                return "🕶️ Style-conscious person wanting prescription sunglasses? You're about to discover the ultimate fusion of fashion and function!";
                            }
                            
                            if (wantsRxSunglasses && Array.isArray(stylePreference) && stylePreference.length >= 2) {
                                return "☀️ Multiple priorities + wanting prescription sunglasses = perfect timing! UV protection with clear vision is life-changing.";
                            }

                            if (hasRxSunglasses && styleImportant) {
                                return "👓 Already rocking prescription sunglasses with style focus? You understand that functional doesn't mean boring!";
                            }

                            if (noRxSunglasses && !styleImportant) {
                                return "🌞 No prescription sunglasses and style isn't your focus? You're missing the functional benefits - clear vision outdoors is transformative!";
                            }

                            // Style priority insights
                            if (styleImportant && hasLuxuryBrands) {
                                return "💎 High-end style preference detected! Luxury frames are investments in both vision quality and personal expression.";
                            }

                            if (styleImportant && comfortImportant) {
                                return "✨ Style + comfort combo? Smart approach - beautiful frames that disappear on your face are the holy grail of eyewear!";
                            }

                            // Value-focused insights
                            if (priceImportant && hasAccessibleBrands) {
                                return "💰 Value-focused with accessible brands? Smart strategy - quality doesn't require premium prices when you choose wisely!";
                            }

                            if (priceImportant && durabilityImportant) {
                                return "🏗️ Price + durability focus? You understand true value - well-made frames cost less per year than cheap ones that break!";
                            }

                            // Comfort prioritizers
                            if (comfortImportant && !styleImportant) {
                                return "😌 Comfort above all? Lightweight materials and perfect fits transform glasses from burden to blessing - function first!";
                            }

                            // Multi-priority insights
                            if (styleImportant && durabilityImportant && comfortImportant) {
                                return "🎯 Style + durability + comfort? You want it all, and premium materials like titanium can deliver exactly that!";
                            }

                            // Brand-agnostic insights
                            if (Array.isArray(brandPreference) && brandPreference.includes("No preference, I'm open to suggestions")) {
                                return "🔍 Open to suggestions? Perfect! This lets us focus on what truly matters - the perfect fit and function for YOUR unique needs.";
                            }

                            return "🎨 Your style DNA is captured! Time to transform those preferences into the perfect eyewear that reflects your personality.";
                            
                        default:
                            return "💡 Great progress! Each answer helps us create your perfect vision solution.";
                    }
                };

                const titles = {
                    "Your Current Setup": "Setup Analysis Complete! 📊",
                    "Lens Comfort & Eye Experience": "Vision Health Mapped! 👁️",
                    "Lifestyle & Vision Needs": "Lifestyle Decoded! 🎯",
                    "Sun, Style & Self-Expression": "Style Profile Ready! ✨"
                };

                return {
                    title: titles[sectionName] || "Section Complete! ✅",
                    insight: generateDynamicInsight(sectionName)
                };
            };

            const checkSectionCompletion = (newStep) => {
                const currentQuestion = questions[newStep - 1];
                const nextQuestion = questions[newStep];
                
                if (!currentQuestion || !nextQuestion) return false;
                
                return currentQuestion.section !== nextQuestion.section;
            };

            const continueAfterInsights = () => {
                setShowSectionComplete(false);
                let newStep = currentStep + 1;
                while (newStep < questions.length && questions[newStep].conditional && !questions[newStep].conditional(answers)) {
                    updateAnswer(newStep, 'skipped'); // Log skipped for AI if needed
                    newStep++;
                }
                setCurrentStep(newStep);
                
                // Scroll to top when continuing after section insights - immediate and smooth
                setTimeout(() => {
                    // Try multiple scroll methods to ensure it works
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                    console.log('Scrolling to top after continueAfterInsights');
                }, 50);
            };

            const nextStep = async () => {
                setShowAllBrands(false); // Reset brand expansion when moving to next question
                let newStep = currentStep + 1;
                while (newStep < questions.length && questions[newStep].conditional && !questions[newStep].conditional(answers)) {
                    updateAnswer(newStep, 'skipped'); // Log skipped for AI if needed
                    newStep++;
                }
                // Check if we're finishing the entire questionnaire
                if (newStep === questions.length) {
                    setCurrentStep(newStep);
                    setTimeout(() => {
                        generateAIInsights();
                    }, 100);
                    return;
                }
                
                // Only show section completion for intermediate sections (not the final one or intro transition)
                const currentQuestion = questions[currentStep];
                const nextQuestion = questions[newStep];
                const isChangingSection = currentQuestion && nextQuestion && currentQuestion.section !== nextQuestion.section;
                const isNotIntroTransition = currentQuestion && currentQuestion.type !== 'intro';
                
                // Only show section completion when moving from one content section to another
                // AND when we've actually completed meaningful questions in the current section
                if (newStep > 1 && isChangingSection && isNotIntroTransition) {
                    // Check if we've answered at least one question in the current section
                    let hasAnsweredInSection = false;
                    for (let i = 0; i <= currentStep; i++) {
                        if (questions[i].section === currentQuestion.section && answers[i] !== undefined) {
                            hasAnsweredInSection = true;
                            break;
                        }
                    }
                    
                    if (hasAnsweredInSection) {
                        const completedSection = questions[currentStep].section;
                        const sectionData = getSectionInsights(completedSection, answers);
                        setCompletedSectionData(sectionData);
                        setShowSectionComplete(true);
                        // Wait for user to click continue - no automatic timeout
                        return;
                    }
                }
                
                // Continue to next question
                setCurrentStep(newStep);
                
                // Scroll to top when loading new question - immediate and smooth
                setTimeout(() => {
                    // Try multiple scroll methods to ensure it works
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                    console.log('Scrolling to top after nextStep');
                }, 50);
            };

            const prevStep = () => {
                let newStep = currentStep - 1;
                while (newStep > 0 && questions[newStep].conditional && !questions[newStep].conditional(answers)) {
                    newStep--;
                }
                setCurrentStep(newStep);
                
                // Scroll to top when going back to previous question - immediate and smooth
                setTimeout(() => {
                    // Try multiple scroll methods to ensure it works
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                    console.log('Scrolling to top after prevStep');
                }, 50);
            };

            const renderSectionComplete = () => {
                if (!completedSectionData) return null;
                
                return React.createElement('div', { className: "text-center space-y-6" },
                    React.createElement('div', { className: "relative w-24 h-24 mx-auto mb-6" },
                        React.createElement('div', { className: "w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg pulse-once" },
                            React.createElement('svg', { 
                                className: "w-12 h-12 text-white", 
                                fill: "none", 
                                stroke: "currentColor", 
                                viewBox: "0 0 24 24"
                            },
                                React.createElement('path', { 
                                    strokeLinecap: "round", 
                                    strokeLinejoin: "round", 
                                    strokeWidth: 3, 
                                    d: "M5 13l4 4L19 7"
                                })
                            )
                        )
                    ),
                    
                    React.createElement('div', { className: "space-y-3" },
                        React.createElement('h2', { className: "text-2xl font-bold text-gray-800" }, completedSectionData.title),
                        React.createElement('p', { className: "text-lg text-gray-600 max-w-md mx-auto" }, completedSectionData.insight)
                    ),
                    
                    React.createElement('button', { 
                        className: "optiqa-button bg-gradient-to-r from-optiqa-blue to-optiqa-navy text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 mt-4",
                        onClick: continueAfterInsights
                    }, "Continue →")
                );
            };

            const renderQuestion = () => {
                if (currentStep >= questions.length) return renderResults();
                
                const q = questions[currentStep];

                if (q.type === 'slider' && answers[currentStep] === undefined) {
                    updateAnswer(currentStep, q.sliderDefault);
                }

                if (q.type === 'intro') {
                    return React.createElement('div', { className: "text-center space-y-8" },
                        React.createElement('div', { className: "w-24 h-24 optiqa-gradient rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg" },
                            React.createElement(Glasses, { className: "w-12 h-12 text-white" })
                        ),
                        React.createElement('h2', { className: "text-4xl font-bold text-optiqa-navy" }, q.title),
                        React.createElement('p', { className: "text-xl text-optiqa-gray max-w-lg mx-auto leading-relaxed" }, q.subtitle),
                        React.createElement('div', { className: "flex items-center justify-center space-x-4 text-sm text-optiqa-blue font-medium" },
                            q.note.split(' • ').map((item, index) => 
                                React.createElement('span', { key: index, className: "flex items-center" },
                                    index > 0 && React.createElement('div', { className: "w-1 h-1 bg-optiqa-blue rounded-full mr-4" }),
                                    item
                                )
                            )
                        )
                    );
                }

                return React.createElement('div', null,
                    React.createElement('h3', { className: "quiz-question-title" }, q.question),
                    React.createElement('div', { className: "quiz-options" },
                        q.options.map((option, index) =>
                            React.createElement('button', {
                                key: index,
                                onClick: () => {
                                    if (q.type === 'multiple') {
                                        const current = answers[currentStep] || [];
                                        const updated = current.includes(option)
                                            ? current.filter(item => item !== option)
                                            : [...current, option];
                                        updateAnswer(currentStep, updated);
                                    } else {
                                        updateAnswer(currentStep, option);
                                        setTimeout(() => {
                                            nextStep();
                                        }, 200);
                                    }
                                },
                                className: `quiz-option-button ${
                                    q.type === 'multiple'
                                        ? (answers[currentStep] || []).includes(option) ? 'selected' : ''
                                        : answers[currentStep] === option ? 'selected' : ''
                                }`
                            }, option)
                        )
                    )
                );
            };

            const renderResults = () => {
                if (isGeneratingInsights) {
                    return React.createElement('div', { className: "text-center space-y-8" },
                        React.createElement('div', { className: "w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6" },
                            React.createElement('div', { className: "animate-spin rounded-full h-10 w-10 border-b-2 border-white" })
                        ),
                        React.createElement('div', { className: "space-y-4" },
                            React.createElement('h2', { className: "text-3xl font-bold text-gray-800" }, "Creating Your Vision Plan"),
                            React.createElement('p', { className: "text-lg text-gray-600" }, "Analyzing your responses to provide personalized recommendations...")
                        ),
                        
                        React.createElement('div', { className: "max-w-md mx-auto space-y-4" },
                            React.createElement('div', { className: "flex justify-between text-sm text-gray-600" },
                                React.createElement('span', null, "Generating your personalized insights"),
                                React.createElement('span', null, Math.round(loadingProgress) + "%" )
                            ),
                            React.createElement('div', { className: "w-full bg-gray-200 rounded-full h-3" },
                                React.createElement('div', {
                                    className: "bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300 ease-out",
                                    style: { width: `${loadingProgress}%` }
                                })
                            ),
                            React.createElement('p', { className: "text-sm text-gray-500" }, "This may take a few moments...")
                        )
                    );
                }

                return React.createElement('div', { className: "space-y-8" },
                    React.createElement('div', { className: "text-center" },
                        React.createElement('div', { className: "w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6" },
                            React.createElement(Sparkles, { className: "w-10 h-10 text-white" })
                        ),
                        React.createElement('h2', { className: "text-3xl font-bold text-gray-800 mb-4" }, "Your Personalized Vision Plan")
                    ),

                    React.createElement('div', { className: "bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100 shadow-lg" },
                        React.createElement('div', { className: "flex items-start space-x-4 mb-6" },
                            React.createElement('div', { className: "w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0" },
                                React.createElement(Sparkles, { className: "w-8 h-8 text-white" })
                            ),
                            React.createElement('div', { className: "flex-1" },
                                React.createElement('h3', { className: "text-2xl font-bold text-gray-800 mb-2" }, "Your Vision Profile"),
                                React.createElement('p', { className: "text-gray-600" }, "AI-powered analysis based on your lifestyle and vision needs")
                            )
                        ),
                        
                        React.createElement('div', { className: "bg-white rounded-xl p-6 shadow-sm border border-gray-100" },
                            React.createElement('div', { className: "max-w-none" },
                                React.createElement('div', { className: "text-gray-700 leading-relaxed space-y-4" },
                                    aiInsights.split('\n').map((line, index) => {
                                        const trimmedLine = line.trim();
                                        if (!trimmedLine) return null;
                                        
                                        if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
                                            const headerText = trimmedLine.slice(2, -2);
                                            return React.createElement('h4', { 
                                                key: index, 
                                                className: "text-lg font-semibold text-gray-800 mb-3 mt-6 first:mt-0" 
                                            }, headerText);
                                        }
                                        
                                        if (trimmedLine.startsWith('•')) {
                                            const bulletText = trimmedLine.substring(1).trim();
                                            const processedText = bulletText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                                            
                                            return React.createElement('div', { 
                                                key: index, 
                                                className: "flex items-start space-x-3 mb-3" 
                                            },
                                                React.createElement('div', { className: "w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0" }),
                                                React.createElement('p', {
                                                    className: "m-0 text-base leading-relaxed text-gray-700",
                                                    dangerouslySetInnerHTML: { __html: processedText }
                                                })
                                            );
                                        }
                                        
                                        const processedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                                        
                                        return React.createElement('p', {
                                            key: index,
                                            className: "m-0 text-base leading-relaxed text-gray-700",
                                            dangerouslySetInnerHTML: { __html: processedLine }
                                        });
                                    })
                                )
                            )
                        )
                    ),

                    React.createElement('div', { className: "text-center" },
                        React.createElement('button', {
                            onClick: downloadResultsAsPDF,
                            className: "inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                        },
                            React.createElement('svg', { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
                                React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" })
                            ),
                            React.createElement('div', { className: "text-left" },
                                React.createElement('div', { className: "text-lg" }, "Download Your Vision Profile Now"),
                                React.createElement('div', { className: "text-sm opacity-90" }, "Bring it to your eye test!")
                            )
                        )
                    ),

                    !hasBookedExam ? renderBookingCalendar() : renderOpticiansList(),

                    React.createElement('div', { className: "text-center text-gray-500 text-sm" },
                        React.createElement('p', null, "💡 Tip: Bring your current glasses and this report to your appointment for the best experience!")
                    )
                );
            };

            const currentQuestion = questions[currentStep];
            const currentSection = currentStep >= questions.length ? "Your Personalized Results" : currentQuestion?.section;

            return React.createElement('div', { className: "quiz-wizard" },
                React.createElement('div', { className: "quiz-header" },
                    React.createElement('a', { 
                        href: "index.html", 
                        className: "logo"
                    }, "VisionMatch"),
                    React.createElement('p', { className: "text-light" }, "Professional Vision Assessment")
                ),
                React.createElement('div', { className: "quiz-content" },
                    currentStep > 0 && React.createElement('div', { className: "progress-bar-container" },
                        React.createElement('div', { className: "progress-bar-track" },
                            React.createElement('div', { 
                                className: "progress-bar-fill",
                                style: { width: `${getProgress()}%` }
                            })
                        )
                    ),

                    React.createElement('div', { className: "visionmatch-card" },
                        showSectionComplete ? renderSectionComplete() : renderQuestion()
                    ),

                    !showSectionComplete && React.createElement('div', { className: "quiz-navigation" },
                        currentStep === 0 ? 
                            React.createElement('div', { style: {width: '100%', textAlign: 'center'} },
                                React.createElement('button', {
                                    onClick: nextStep,
                                    className: "cta-primary"
                                }, "Begin Assessment")
                            ) :
                            React.createElement(React.Fragment, null,
                                React.createElement('button', {
                                    onClick: prevStep,
                                    disabled: currentStep === 0,
                                    className: "nav-btn"
                                }, "Previous"),
                                currentStep < questions.length && 
                                    React.createElement('button', {
                                        onClick: nextStep,
                                        disabled: !isAnswered(),
                                        className: `cta-primary ${!isAnswered() ? 'disabled' : ''}`
                                    }, currentStep === questions.length - 1 ? 'Get My Results' : 'Next')
                            )
                    )
                )
            );
        };

        // Google Maps already initialized at page head

        // Initialize Google Maps for opticians when the component mounts
        window.initOpticiansMap = function() {
            const mapElement = document.getElementById('opticians-map');
            if (!mapElement || !window.google) return;

            const madrid = { lat: 40.4168, lng: -3.7038 };
            
            const map = new google.maps.Map(mapElement, {
                zoom: 14,
                center: madrid,
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }]
                    }
                ]
            });

            const stores = [
                { name: "Optica Nova", position: { lat: 40.4168, lng: -3.7038 }, color: "red" },
                { name: "CentroVisión", position: { lat: 40.4155, lng: -3.7074 }, color: "blue" },
                { name: "Óptica Bassol", position: { lat: 40.4378, lng: -3.6888 }, color: "green" }
            ];

            stores.forEach((store, index) => {
                const marker = new google.maps.Marker({
                    position: store.position,
                    map: map,
                    title: store.name,
                    label: {
                        text: String(index + 1),
                        color: "white",
                        fontWeight: "bold"
                    },
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: store.color === "red" ? "#ef4444" : store.color === "blue" ? "#3b82f6" : "#22c55e",
                        fillOpacity: 1,
                        strokeColor: "white",
                        strokeWeight: 2,
                        scale: 12
                    }
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: `<div class="p-2">
                        <h3 class="font-bold text-gray-800">${store.name}</h3>
                        <p class="text-sm text-gray-600">Click for directions</p>
                    </div>`
                });

                marker.addListener('click', () => {
                    infoWindow.open(map, marker);
                });
            });
        };

        // Check if map should be initialized periodically
        const checkForMap = setInterval(() => {
            if (document.getElementById('opticians-map') && window.google) {
                window.initOpticiansMap();
                clearInterval(checkForMap);
            }
        }, 1000);

        ReactDOM.render(React.createElement(GlassesFinderWizard), document.getElementById('root'));