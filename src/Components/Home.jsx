import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Home = () => {

    const navigateToMenu = useNavigate();

    useEffect(() => {
        const showcaseItems = document.querySelectorAll('.showcase-item-1, .showcase-item-2');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        showcaseItems.forEach(item => {
            observer.observe(item);
        });

        // Cleanup observer on unmount
        return () => {
            showcaseItems.forEach(item => {
                observer.unobserve(item);
            });
        };
    }, []);


    // Helper function to split text into letters
    const LetterSpan = ({ text }) => {
        return text.split('').map((letter, index) => (
            <span
                key={index}
                style={{ '--letter-index': index }}
                className="letter"
            >
                {letter === ' ' ? '\u00A0' : letter}
            </span>
        ));
    };

    return (
        <>

            <div className='frontpg'>
                <img src="https://media.licdn.com/dms/image/v2/D4D12AQE8CRxbxq8tzQ/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1682579035972?e=2147483647&v=beta&t=HB6oZhY_WV2u0_kYQ8yraUPfcx7Hc6FHsfGkePlmyvc" alt="img" />
                <div className="overlay">
                    <p>Fueling Campus Life with Affordable, Fresh, and Tasty Bites...</p>
                    <br />
                    <h1><span>Eat!</span> <br /><span>Enjoy!</span><br /><span>Energize!</span></h1>
                    <button onClick={() => navigateToMenu("/menu")}> Order Snacks </button>
                </div>

                <div className="showcase">
                    <div className="showcase-item-1">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgpDiULJful033Wh-oYuh3gwOrwFfggxpg9A&s" alt="paneerchilli" />
                        <div className="abtFood" id="abtPC">
                            <h1><LetterSpan text="Crispy Paneer Chilli Sensation" /></h1>
                            <p>Dive into the delicious flavors...</p>
                        </div>
                    </div>

                    <div className="showcase-item-2">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkTRWG56HFqs9J3-472XnC797A8CYm0tQVxQ&s" alt="dosa" />
                        <div className="abtFood" id="abtPFR">
                            <h1><LetterSpan text="Spice Up Your Day with Paneer Fried Rice!" /></h1>
                            <p>Savor the rich, savory goodness of Paneer Fried Rice—packed with aromatic spices and bursting with flavor! Freshly made for the ultimate comfort in every bite!</p>
                        </div>
                    </div>
                </div>

                <div className="line-text-line">
                    <hr className="line" />
                    <a href="/menu" className="text">
                        🍴Explore the Full Menu
                    </a>
                    <hr className="line" />
                </div>

            </div>
        </>
    );
};
export default Home;