import { client } from 'react';
import FlipBoard from './flipboard.client.js';

export default function Home() {
    return (
        <div>
            <client>
                <div>
                    <FlipBoard text="Hello World"></FlipBoard>

                </div>
            </client>
        </div>
    );
}
