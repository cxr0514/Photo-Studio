import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import Loader from './components/Loader';
import Lightbox from './components/Lightbox';
import History from './components/History';
import { generateEditedImage, getSceneIdea, getSceneIdeaFromImage, getStyleSuggestions } from './services/geminiService';
import { ImageFile, AspectRatio, LightingStyle, CameraPerspective } from './types';
import { ASPECT_RATIO_OPTIONS, LIGHTING_STYLE_OPTIONS, CAMERA_PERSPECTIVE_OPTIONS } from './constants';
import { resizeImageCanvas } from './utils/fileUtils';

const App: React.FC = () => {
    const [productImage, setProductImage] = useState<ImageFile | null>(null);
    const [scenePrompt, setScenePrompt] = useState<string>('');
    const [sceneIdeaText, setSceneIdeaText] = useState<string>('');
    const [sceneIdeaImage, setSceneIdeaImage] = useState<ImageFile | null>(null);
    const [styleDescription, setStyleDescription] = useState<string>('');
    const [isGettingIdeaFromText, setIsGettingIdeaFromText] = useState<boolean>(false);
    const [isGettingIdeaFromImage, setIsGettingIdeaFromImage] = useState<boolean>(false);
    const [isSuggestingStyle, setIsSuggestingStyle] = useState<boolean>(false);

    const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
    const [lightingStyle, setLightingStyle] = useState<LightingStyle>(LightingStyle.STUDIO_SOFTBOX);
    const [cameraPerspective, setCameraPerspective] = useState<CameraPerspective>(CameraPerspective.EYE_LEVEL);

    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<string[]>([]);

    const handleGetIdeaFromText = async () => {
        if (!sceneIdeaText) return;
        setIsGettingIdeaFromText(true);
        setError(null);
        try {
            const idea = await getSceneIdea(sceneIdeaText);
            setScenePrompt(idea);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get scene idea.');
        } finally {
            setIsGettingIdeaFromText(false);
        }
    };

    const handleGetIdeaFromImage = async () => {
        if (!sceneIdeaImage) return;
        setIsGettingIdeaFromImage(true);
        setError(null);
        try {
            const idea = await getSceneIdeaFromImage(sceneIdeaImage);
            setScenePrompt(idea);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get scene idea.');
        } finally {
            setIsGettingIdeaFromImage(false);
        }
    };

    const handleSuggestStyle = async () => {
        if (!productImage) return;
        setIsSuggestingStyle(true);
        setError(null);
        try {
            const suggestions = await getStyleSuggestions(productImage, styleDescription);
            setLightingStyle(suggestions.lightingStyle);
            setCameraPerspective(suggestions.cameraPerspective);
            setScenePrompt(suggestions.sceneDescription);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get style suggestions.');
        } finally {
            setIsSuggestingStyle(false);
        }
    };

    const handleGenerate = async () => {
        if (!productImage) {
            setError('Please upload a product photo.');
            return;
        }
        setError(null);
        setIsLoading(true);
        setGeneratedImage(null);

        let finalPrompt = `Generate a high-resolution, photorealistic product shot of the subject from the first image. `;
        finalPrompt += `The image should have a professional, clean aesthetic suitable for an e-commerce website or marketing campaign. `;
        finalPrompt += `The aspect ratio must be ${aspectRatio}. `;
        finalPrompt += `The lighting should be ${lightingStyle}, creating a specific mood and highlighting the product's features. `;
        finalPrompt += `The camera angle should be a ${cameraPerspective}, providing a clear and engaging view of the product. `;

        if (scenePrompt) {
            finalPrompt += `\n\n--- SCENE DESCRIPTION ---\n${scenePrompt}\n--- END SCENE DESCRIPTION ---\n\n`;
        } else {
            finalPrompt += `The background should be simple and non-distracting, complementing the product. `;
        }
        finalPrompt += `Ensure the final image is polished and visually appealing.`;

        try {
            const formattedProductImage = await resizeImageCanvas(productImage, aspectRatio);
            const result = await generateEditedImage(formattedProductImage, finalPrompt);

            if (result.imageUrl) {
                setGeneratedImage(result.imageUrl);
                setHistory(prevHistory => [result.imageUrl, ...prevHistory]);
            } else {
                setError("The model did not return an image. It might have returned text instead: " + result.text);
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = () => {
        if (!generatedImage) return;

        const link = document.createElement('a');
        link.href = generatedImage;
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `generated_image_${timestamp}.jpeg`;
        
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const ControlSelect = <T extends string,>({ label, value, onChange, options }: { label: string; value: T; onChange: React.Dispatch<React.SetStateAction<T>>; options: { value: T; label: string }[] }) => (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value as T)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    );

    const isBusy = isLoading || isGettingIdeaFromText || isGettingIdeaFromImage || isSuggestingStyle;
    
    const generateButtonText = () => {
        if (isLoading) return 'Generating...';
        if (isBusy) return 'Processing...';
        return '✨ Generate Image';
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <main className="container mx-auto p-4 md:p-8">
                <header className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
                        AI Product Photo Studio
                    </h1>
                    <p className="mt-2 text-gray-400">Transform your product images with the power of generative AI.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Controls Column */}
                    <div className="bg-gray-800/50 rounded-xl p-6 shadow-2xl border border-gray-700">
                        <div className="space-y-6">
                            <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2">1. Upload Product</h2>
                            <ImageUploader
                                id="product-image"
                                label="Upload Product Photo"
                                onImageUpload={setProductImage}
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                            />

                            <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 pt-4">2. Customize Style</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <ControlSelect label="Aspect Ratio" value={aspectRatio} onChange={setAspectRatio} options={ASPECT_RATIO_OPTIONS} />
                                <ControlSelect label="Lighting Style" value={lightingStyle} onChange={setLightingStyle} options={LIGHTING_STYLE_OPTIONS} />
                                <ControlSelect label="Camera Perspective" value={cameraPerspective} onChange={setCameraPerspective} options={CAMERA_PERSPECTIVE_OPTIONS} />
                            </div>

                            <div className="pt-2 space-y-2">
                                <div className="flex items-center my-2">
                                    <div className="flex-grow border-t border-gray-700"></div>
                                    <span className="flex-shrink mx-4 text-gray-400 font-semibold text-sm">Or Get AI Suggestions</span>
                                    <div className="flex-grow border-t border-gray-700"></div>
                                </div>
                                <label htmlFor="style-description" className="block text-sm font-medium text-gray-300">Describe your product or brand (optional)</label>
                                <div className="flex gap-2">
                                    <input
                                        id="style-description"
                                        type="text"
                                        value={styleDescription}
                                        onChange={(e) => setStyleDescription(e.target.value)}
                                        className="flex-grow bg-gray-700 border border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="e.g., a luxury watch for adventurous people"
                                        disabled={isBusy}
                                    />
                                    <button
                                        onClick={handleSuggestStyle}
                                        disabled={!productImage || isBusy}
                                        className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                                    >
                                        {isSuggestingStyle ? 'Suggesting...' : '✨ Suggest Style'}
                                    </button>
                                </div>
                            </div>

                            <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 pt-4">3. Describe the Scene</h2>
                            <div>
                                <label htmlFor="scene-prompt" className="block text-sm font-medium text-gray-300 mb-1">Create Your Own Scene</label>
                                <textarea
                                    id="scene-prompt"
                                    value={scenePrompt}
                                    onChange={(e) => setScenePrompt(e.target.value)}
                                    rows={4}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                    placeholder="e.g., A sunny beach with palm trees and a gentle surf."
                                    disabled={isBusy}
                                />
                            </div>

                            <div className="text-center my-2">
                                <span className="text-gray-400 font-semibold text-sm">Or Get Scene Ideas</span>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="scene-idea-text" className="block text-sm font-medium text-gray-300">From a Description</label>
                                <div className="flex gap-2">
                                    <input
                                        id="scene-idea-text"
                                        type="text"
                                        value={sceneIdeaText}
                                        onChange={(e) => setSceneIdeaText(e.target.value)}
                                        className="flex-grow bg-gray-700 border border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Describe a scene idea to get a detailed prompt."
                                        disabled={isBusy}
                                    />
                                    <button
                                        onClick={handleGetIdeaFromText}
                                        disabled={isBusy || !sceneIdeaText}
                                        className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                                    >
                                        {isGettingIdeaFromText ? 'Getting...' : 'Get'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center my-2">
                                <div className="flex-grow border-t border-gray-700"></div>
                                <span className="flex-shrink mx-4 text-gray-500 text-xs">OR</span>
                                <div className="flex-grow border-t border-gray-700"></div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">From a Style Image</label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-grow">
                                        <ImageUploader
                                            id="style-image"
                                            label="Upload Style"
                                            onImageUpload={setSceneIdeaImage}
                                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
                                            heightClassName="h-32"
                                        />
                                    </div>
                                    <button
                                        onClick={handleGetIdeaFromImage}
                                        disabled={isBusy || !sceneIdeaImage}
                                        className="px-4 py-2 self-stretch text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                                    >
                                        {isGettingIdeaFromImage ? 'Getting...' : 'Get Ideas'}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleGenerate}
                                    disabled={isBusy || !productImage}
                                    className="w-full text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                                >
                                    {generateButtonText()}
                                </button>
                            </div>
                            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                        </div>
                    </div>


                    {/* Result Column */}
                    <div className="bg-gray-800/50 rounded-xl p-6 shadow-2xl border border-gray-700 flex flex-col items-center justify-center relative min-h-[400px] lg:min-h-0">
                        {isLoading && <Loader />}
                        {!isLoading && !generatedImage && (
                            <div className="text-center text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16" fill="none" viewBox="http://www.w3.org/2000/svg"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <p className="mt-4 text-lg">Your generated image will appear here</p>
                            </div>
                        )}
                        {generatedImage && (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                                <img
                                    src={generatedImage}
                                    alt="Generated product"
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity flex-grow"
                                    onClick={() => setLightboxImage(generatedImage)}
                                />
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                                    aria-label="Download generated image"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    <span>Download</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {history.length > 0 && (
                    <div className="mt-8 bg-gray-800/50 rounded-xl p-6 shadow-2xl border border-gray-700">
                        <History images={history} onImageClick={setLightboxImage} />
                    </div>
                )}
            </main>
            {lightboxImage && <Lightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />}
        </div>
    );
};

export default App;