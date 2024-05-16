import { client } from 'react';
import FlipBoard from './flipboard.client.js';

export default function Home() {
    return (
        <div>
            <client>
                <div>
                    <FlipBoard text="HelloWorld"></FlipBoard>
                </div>
            </client>
        </div>
    );
}
