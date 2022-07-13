import React, { useEffect } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'


import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import masker from './img/star.png'

function Type1() {
  
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger)

        const lenis = new Lenis({
            lerp: 0.06,
            smooth: true,
        });
        const scrollFn = () => {
            lenis.raf();
            requestAnimationFrame(scrollFn);
        };
        requestAnimationFrame(scrollFn);

        const allFirstTextLayer = document.querySelectorAll('.first .col-3')
        const allBannerTextLayer = document.querySelectorAll('.col-1 h1')

        function Alignment(elem,i) {
            gsap.fromTo(elem,{"--alignment":"0%","--alignment2":"0%"},{
                "--alignment":"100%",
                "--alignment2":"45%",
                ease:"power2.out",
                duration:1+i/Math.sqrt(allBannerTextLayer.length * Math.PI)

            })
        }

        allFirstTextLayer.forEach((elem,i) => {
            if (elem.children[0]) {
                elem.classList.add("active1")
                elem.classList.add("active2")
                // document.styleSheets[0].insertRule()
                elem.children[0].classList.add("starter")
                elem.children[0].innerHTML = `<span class="hide"> ${elem.textContent} </span>`

                gsap.to(elem.children[0].children[0],{
                    y:0,
                    ease:"power2.out",
                    duration:1+i/Math.sqrt(allFirstTextLayer.length)
                })

                
                gsap.fromTo(elem.children[0],
                    {
                    "--alignment":"0%",
                    "--alignment2":"0%",
                    },{
                    "--alignment":"100%",
                    "--alignment2":"45%",
                    ease:"power2.out",
                    duration:1+i/Math.sqrt(allBannerTextLayer.length),
                    // onComplete: () => {console.log("DONE")}
                    
                })
                Alignment(elem,i)
            }
            if (elem.children[0] == undefined) {
                elem.classList.add("active3")
                elem.classList.add("active4")
                Alignment(elem,i)
            }
        })

        allBannerTextLayer.forEach((elem,i) => {
            elem.innerHTML = `<span class="size"> ${elem.textContent} </span> <div class='circle'></div>`
            // console.log(elem.children[0])
            gsap.fromTo([elem.children[0],elem.children[1]],{
                scale:0,
            },{
                scale:1,
                ease:"elastic.out",
                duration:1+i/Math.sqrt(allBannerTextLayer.length)
            })
        })


        // Second phase 
        var parentText = document.querySelector('.childrensText')

        for (let i = 0; i < 224; i++) {
            const createElem = document.createElement('div')
            createElem.setAttribute("class","text-child");
            const createH5 = document.createElement('h5')
            createH5.setAttribute("class","font-child");
            createH5.textContent = "Ellipse"
            createElem.appendChild(createH5)
            parentText.appendChild(createElem)           
        }
        console.log(parentText)

        let allEllText = document.querySelectorAll(".font-child")

        const utils = gsap.utils.toArray(allEllText)
        console.log(utils)
        utils.forEach((elem,i) => {
            gsap.fromTo(elem, { y:"150%" },{
                y:"0%",
                ease:"power2.out",
                // duration:3,
                scrollTrigger:{
                    trigger:elem,
                    // start:"top 60%",
                    // end:"bottom 70%",
                    scrub:2,
                    toggleActions:"play reverse play reverse"
                    // scrub:true,
                }
            })
        })

        let renderer, scene, camera;

        let particles;

        const PARTICLE_SIZE = 20;


        init();

        // Shapes Pop
        function init() {
            let containerScene = document.querySelector('.scene')
            scene = new THREE.Scene();

            camera = new THREE.PerspectiveCamera( 45, containerScene.clientWidth / containerScene.clientHeight, 1, 10000 );
            camera.position.z = 300;

            //

            // let sphereboxGeometry = new THREE.BoxGeometry( 200, 200, 200, 30, 30, 30 );
            let sphereboxGeometry = new THREE.SphereGeometry( 100, 50, 20,0,2 * Math.PI,0, Math.PI );

            sphereboxGeometry.deleteAttribute( 'normal' );
            sphereboxGeometry.deleteAttribute( 'uv' );

            sphereboxGeometry = BufferGeometryUtils.mergeVertices( sphereboxGeometry );

            //

            const positionAttribute = sphereboxGeometry.getAttribute( 'position' );

            const colors = [];
            const sizes = [];

            const color = new THREE.Color(0xfff);

            for ( let i = 0, l = positionAttribute.count; i < l; i ++ ) {

                color.setHSL(1,1,1);
                color.toArray( colors, i * 3 );

                sizes[ i ] = PARTICLE_SIZE * 0.3;

            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute( 'position', positionAttribute );
            geometry.setAttribute( 'customColor', new THREE.Float32BufferAttribute( colors, 1 ) );
            geometry.setAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ) );

            //

            const material = new THREE.ShaderMaterial( {
                uniforms: {
                    color: { value: new THREE.Color( 0xfffccc ) },
                    pointTexture: { value: new THREE.TextureLoader().load( masker ) },
                    alphaTest: { value: 0.9 }
                },
                vertexShader: `
                attribute float size;
                attribute vec3 customColor;
        
                varying vec3 vColor;
        
                void main() {
        
                    vColor = customColor;
        
                    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        
                    gl_PointSize = size * ( 300.0 / -mvPosition.z );
        
                    gl_Position = projectionMatrix * mvPosition;
        
                }
                `,
                fragmentShader: `
                uniform vec3 color;
                uniform sampler2D pointTexture;
                uniform float alphaTest;
        
                varying vec3 vColor;
        
                void main() {
        
                    gl_FragColor = vec4( color * vColor, 1.0 );
        
                    gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
        
                    if ( gl_FragColor.a < alphaTest ) discard;
        
                }
                `,

            } );

            particles = new THREE.Points( geometry, material );
            scene.add( particles );

            // let geometry2 = new THREE.BufferGeometry();
            // let number = 512 * 512;
    
            // let positions = new THREE.BufferAttribute(
            //     new Float32Array(number*3),3
            // )
            
            // let mesh = new THREE.Points( glTFGeometry, material );
            // scene.add( mesh );

            //

            renderer = new THREE.WebGLRenderer({antialias:true,alpha:true});
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( containerScene.clientWidth, containerScene.clientHeight );
            containerScene.appendChild( renderer.domElement );


            window.addEventListener( 'resize', onWindowResize );            
    
            function onWindowResize() {
    
                camera.aspect = containerScene.clientWidth / containerScene.clientHeight;
                camera.updateProjectionMatrix();
    
                renderer.setSize( containerScene.clientWidth, containerScene.clientHeight );
    
            }
    
            function animate() {
                requestAnimationFrame( animate );
    
                render();
                
            }
            animate();
            
            gsap.to(particles.rotation,{
                y:3,
                x:1,
                // z:2,
                scrollTrigger:{
                    trigger:containerScene,
                    scrub:true,
                    toggleActions:"play reverse play reverse"

                }
            })
    
            function render() {
    
                // particles.rotation.x += 0.0005;

                // particles.rotation.y += 0.001;
    
                renderer.render( scene, camera );

    
            }
        }


        // Third phase
        let thirdContainer = document.querySelector('.third')
        let thirdTextsOrig = document.querySelectorAll('.third .orig')
        let thirdTextsClone = document.querySelectorAll('.third .clone')
        let thirdImages = document.querySelectorAll('.third .item')
        let thirdNumbers = document.querySelectorAll('.third .l-text h2')
        let tl3 = gsap.timeline({
            scrollTrigger:{
                trigger:thirdContainer,
                pin:true,
                end:() => `${thirdContainer.clientHeight * 4}px`,
                scrub:true,
                toggleActions:"play reverse play reverse"
            }
        })

        let tl3_2 = gsap.timeline({
            scrollTrigger:{
                trigger:thirdContainer,
                pin:true,
                end:() => `${thirdContainer.clientHeight * 4}px`,
                scrub:true,
                toggleActions:"play reverse play reverse"
            }
        })

        let tl3_3 = gsap.timeline({
            scrollTrigger:{
                trigger:thirdContainer,
                pin:true,
                end:() => `${thirdContainer.clientHeight * 4}px`,
                scrub:true,
                toggleActions:"play reverse play reverse"
            }
        })

        thirdTextsOrig.forEach((elem,i) => {
            // console.log(elem)
            // console.log(thirdTextsClone[i])
            tl3.to([elem.children[0],thirdTextsClone[i].children[0]],{
                // y: thirdTextsOrig.length == i+1 ? "0%" : "-100%",
                y: thirdTextsOrig.length == i+1 ? "0%" : "-100%",
                ease:"none",
            })
            tl3_2.to(thirdImages[i].children[0],{
                rotate:`${10*i}deg`,
                opacity:1,
                ease:"none"
            })
            tl3_3.to(thirdNumbers[i].children[0],{
                // y: thirdNumbers.length == i+1 ? "0%" : "-100%",
                y: thirdNumbers.length == i+1 ? "0%" : "-100%",
                ease:"none",
            })

            console.log(thirdImages[i].children[0])
        })

        // console.log(thirdTextsOrig,thirdTextsClone)
        


    },[])

    return (
        <div className='container-fluid'>
            
            <section className="first" id="first">
                <div className="banner row d-flex align-items-center justify-content-center">
                    <div className="col-1">
                        <h1> 
                            T 
                            <div className="circle"></div>
                        </h1>
                    </div>
                    <div className="col-1">
                        <h1> 
                            Y 
                            <div className="circle"></div>
                        </h1>
                    </div>
                    <div className="col-1">
                        <h1> 
                            P 
                            <div className="circle"></div>
                        </h1>
                    </div>
                    <div className="col-1">
                        <h1> 
                            O 
                            <div className="circle"></div>
                        </h1>
                    </div>
                    <div className="col-1">
                        <h1> 
                            G 
                            <div className="circle"></div>
                        </h1>
                    </div>
                    <div className="col-1">
                        <h1> 
                            R 
                            <div className="circle"></div>
                        </h1>
                    </div>
                    <div className="col-1">
                        <h1> 
                            A 
                            <div className="circle"></div>
                        </h1>
                    </div>
                    <div className="col-1">
                        <h1> 
                            P 
                            <div className="circle"></div>
                        </h1>
                    </div>
                    <div className="col-1">
                        <h1> 
                            H 
                            <div className="circle"></div>
                        </h1>
                    </div>
                    <div className="col-1">
                        <h1> 
                            Y 
                            <div className="circle"></div>
                        </h1>
                    </div>
                </div>
                <div className="d-grid">
                    <div className="row row-cols-4">
                        <div className="col-3">
                            <h1> DESIGNING </h1>
                            {/* <h1 className='hidden'> DESIGNING </h1> */}
                        </div>
                        <div className="col-3"></div>
                        <div className="col-3"></div>
                        <div className="col-3"></div>
                    </div>
                    <div className="row row-cols-4">
                        <div className="col-3">
                            <h1> DESIGNING </h1>
                            {/* <h1 className='hidden'> DESIGNING </h1> */}
                        </div>
                        <div className="col-3">
                            <h1> DESIGNING </h1>
                            {/* <h1 className='hidden'> DESIGNING </h1> */}
                        </div>
                        <div className="col-3"></div>
                        <div className="col-3"></div>
                    </div>
                    <div className="row row-cols-4">
                        <div className="col-3">
                            <h1>
                                DESIGNING
                            </h1>
                            {/* <h1 className='hidden'> DESIGNING </h1> */}
                        </div>
                        <div className="col-3">
                            <h1>
                                DESIGNING
                            </h1>
                            {/* <h1 className='hidden'> DESIGNING </h1> */}
                        </div>
                        <div className="col-3">
                            <h1>
                                DESIGNING
                            </h1>
                            {/* <h1 className='hidden'> DESIGNING </h1> */}
                        </div>
                        <div className="col-3"></div>
                    </div>
                    <div className="row row-cols-4">
                        <div className="col-3">
                            <h1>
                                DESIGNING
                            </h1>
                            {/* <h1 className='hidden'> DESIGNING </h1> */}
                        </div>
                        <div className="col-3">
                            <h1> DESIGNING </h1>
                            {/* <h1 className='hidden'> DESIGNING </h1> */}
                        </div>
                        <div className="col-3">
                            <h1> DESIGNING </h1>
                            {/* <h1 className='hidden'> DESIGNING </h1> */}
                        </div>
                        <div className="col-3">
                            <h1> DESIGNING </h1>
                            {/* <h1 className='hidden'> DESIGNING </h1> */}
                        </div>
                    </div>
                </div>

                <div className="crossword-containers">
                    <div className="row py-5 align-items-center justify-content-center">
                        <div className="col-2 left">

                            <div className="itemsWrapper">
                                <h1 class="marquee">
                                    <span className="transfer">
                                        CROSS 
                                        <span className="trans">
                                            CROSS 
                                        </span>
                                        <span className="trans-2">
                                            CROSS
                                        </span>
                                        &nbsp;
                                    </span>
                                </h1>
                                <h1 class="marquee marquee2">
                                    <span className="transfer">
                                        CROSS 
                                        <span className="trans">
                                            CROSS 
                                        </span>
                                        <span className="trans-2">
                                            CROSS
                                        </span>
                                        &nbsp;
                                    </span>
                                </h1>   
                            </div>
                            
                        </div>
                        <div className="col-5">
                            <div className="crosswords">
                                <h1> CROSSWORDS </h1> 
                                <h1> CROSSWORDS </h1> 
                            </div>
                        </div>

                        <div className="col-2 right">
                            <div className="itemsWrapper">
                                <h1 class="marquee">
                                    <span className="transfer">
                                        WORDS 
                                        <span className="trans">
                                            WORDS 
                                        </span>
                                        <span className="trans-2">
                                            WORDS
                                        </span> 
                                        &nbsp;    
                                    </span>
                                </h1>
                                <h1 class="marquee marquee2">
                                    <span className="transfer">
                                        WORDS 
                                        <span className="trans">
                                            WORDS 
                                        </span>
                                        <span className="trans-2">
                                            WORDS
                                        </span> 
                                        &nbsp;    
                                    </span>
                                </h1>   
                            </div>
                        </div>

                    </div>
                </div>

                <div className="going-black">
                    <div className="ranger">
                        <h1> GOING BLACK </h1>
                    </div>
                </div>
            </section>

            <section className="second" id="second">

                <div className="layer"></div>
                <div className="parentShape">
                    <div className="sceneCover">
                        <div className="scene"></div>
                    </div>
                    <div className="childrensText"></div>
                </div>
                <div className="layer">
                    <div className="going-black">
                        <div className="ranger">
                            <h1> GOING WHITE </h1>
                        </div>
                    </div>
                </div>
            
            </section>
            
            <section className="third" id="third">
                <div className="leo-container">
                    <div className="title"> 
                        <h1> Leonardo Da Vinci </h1>
                    </div>
                </div>
                <div className="gallery-containers">
                    <div className="left">
                        <div className="item"><img src="./img/Monalisa.jpg" alt="" /></div>
                        <div className="item"><img src="./img/l1.jpg" alt="" /></div>
                        <div className="item"><img src="./img/l2.jpg" alt="" /></div>
                        <div className="item"><img src="./img/l3.jpg" alt="" /></div>
                    </div>
                    <div className="right">
                        <div className="text">
                            <div className="l-text">
                                <h2> 
                                    <div className="hide">
                                        01 
                                    </div>
                                </h2>
                                <h2 className='l-init'> 
                                    <span className='hide'>
                                        02 
                                    </span>
                                </h2>
                                <h2 className='l-init'> 
                                    <span className="hide">
                                        03 
                                    </span>
                                </h2>
                                <h2 className='l-init'> 
                                    <span className="hide">
                                        04 
                                    </span>
                                </h2>
                                <svg width="200" xmlns="http//www.w3.org/2000/svg" viewBox="0 0 50 50">
                                    <circle id="c1" cx="25" cy="25" r="24" stroke-width="0.5" stroke="black" fill="none" transform="rotate(90 25 25)"  pathLength="100" />
                                </svg>
                            </div>
                            <div className="r-text">

                                <h2 className='orig'> 
                                    <span className="hide">
                                        Mona Lisa
                                    </span>
                                </h2>
                                <h2 className='orig'> 
                                    <span className='hide'>
                                        Last Supper
                                    </span>
                                </h2>
                                <h2 className='orig'> 
                                    <span className="hide">
                                        Vitruvia Man
                                    </span>
                                </h2>
                                <h2 className='orig'>
                                    <span className="hide">
                                        Self Draw
                                    </span>
                                </h2>

                                <h2 className="clone">
                                    <span className="hide">
                                        Mona Lisa
                                    </span>
                                </h2>
                                <h2 className="clone">
                                    <span className="hide">
                                        Last Supper
                                    </span>
                                </h2>
                                <h2 className="clone">
                                    <span className="hide">
                                        Vitruvia Man
                                    </span>
                                </h2>
                                <h2 className="clone">
                                    <span className="hide">
                                        Self Draw
                                    </span>
                                </h2>

                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <section className="fourth d-grid" id="fourth">
                <div className="banner-text">
                    <div className="title">
                        <h1> Final Typography</h1>
                    </div>
                    <div className="svgBanner">
                        <svg width="1052" height="176" viewBox="0 0 1052 176" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M1.60066 79.2996C1.59955 79.3005 1.59908 79.3008 0.999989 78.5001C0.400898 77.6994 0.401706 77.6988 0.403153 77.6978L0.432861 77.6756L0.525537 77.6066C0.60738 77.5458 0.729164 77.4556 0.88982 77.3371C1.21113 77.1001 1.68794 76.7502 2.31168 76.2973C3.55917 75.3914 5.39447 74.0731 7.74917 72.4211C12.4584 69.1171 19.2459 64.4777 27.5641 59.132C44.1971 48.4426 66.9656 34.9195 91.4852 23.6037C115.991 12.2944 142.317 3.15618 166.049 1.29743C189.795 -0.562446 211.106 4.86304 225.286 22.8817C230.8 29.8885 230.469 39.8554 228.322 50.2008C227.241 55.409 225.68 60.7999 224.091 66.0786C223.817 66.9885 223.542 67.8947 223.269 68.7961C221.954 73.1393 220.671 77.371 219.663 81.3674C218.445 86.1972 217.648 90.6077 217.667 94.3722C217.687 98.1351 218.522 101.131 220.442 103.269C222.355 105.399 225.496 106.846 230.495 107.186C235.501 107.526 242.265 106.747 251.261 104.529C269.189 100.109 288.709 89.8634 308.965 77.9837C315.367 74.2294 321.844 70.3109 328.362 66.3675C342.417 57.8641 356.662 49.2456 370.754 41.9112C391.387 31.1721 411.852 23.0937 431.175 22.1024C450.566 21.1078 468.757 27.2539 484.74 44.8273C507.356 69.6948 513.011 95.5004 519.145 123.499C519.421 124.756 519.698 126.018 519.977 127.285C520.357 129.012 520.969 130.279 521.748 131.185C522.519 132.082 523.496 132.673 524.696 132.994C527.153 133.649 530.561 133.171 534.89 131.672C543.517 128.683 555.061 121.92 568.319 114.075L569.542 113.352C582.443 105.716 596.837 97.1967 611.479 90.3805C626.577 83.3519 642.025 78.091 656.459 77.501C678.051 76.6183 696.661 84.3287 713.564 95.6761C728.074 105.416 741.391 117.884 754.279 129.949C756.383 131.919 758.476 133.879 760.561 135.814C775.46 149.643 789.929 162.214 805.337 168.896C820.665 175.544 836.933 176.366 855.536 166.614C869.224 159.439 876.943 148.403 881.736 135.446C886.37 122.917 888.248 108.654 890.128 94.3807L890.34 92.771C892.287 78.0224 894.347 63.325 899.655 50.9167C904.987 38.4522 913.609 28.2637 928.646 22.565C951.33 13.9678 972.831 11.4803 993.249 15.1773C1013.67 18.8743 1032.93 28.743 1051.16 44.7487L1049.84 46.2516C1031.83 30.4426 1012.89 20.7669 992.892 17.1453C972.891 13.5237 951.76 15.9436 929.354 24.4352C914.912 29.9086 906.651 39.6469 901.493 51.7033C896.312 63.8159 894.277 78.2334 892.323 93.0327C892.248 93.5983 892.174 94.1644 892.099 94.7309C890.23 108.93 888.326 123.395 883.611 136.14C878.693 149.436 870.696 160.925 856.464 168.386C837.288 178.438 820.383 177.602 804.541 170.731C788.777 163.895 774.076 151.087 759.2 137.28C757.103 135.333 755.002 133.367 752.894 131.393C739.998 119.321 726.813 106.979 712.45 97.3366C695.762 86.1343 677.569 78.6397 656.541 79.4993C642.496 80.0734 627.33 85.2071 612.323 92.1936C597.773 98.9671 583.454 107.442 570.532 115.09L569.338 115.796C556.153 123.598 544.408 130.492 535.544 133.562C531.128 135.091 527.239 135.742 524.18 134.926C522.623 134.511 521.287 133.716 520.231 132.489C519.184 131.271 518.455 129.676 518.023 127.715C517.751 126.481 517.482 125.251 517.214 124.027C511.063 95.9679 505.51 70.6375 483.26 46.173C467.697 29.0605 450.094 23.1346 431.278 24.0998C412.394 25.0685 392.241 32.9821 371.677 43.6853C357.643 50.9899 343.493 59.5509 329.468 68.0364C322.936 71.9884 316.431 75.9241 309.977 79.7089C289.717 91.5904 269.977 101.975 251.739 106.471C242.652 108.712 235.66 109.542 230.36 109.181C225.051 108.82 221.334 107.256 218.954 104.605C216.58 101.961 215.689 98.4041 215.667 94.3827C215.646 90.3628 216.493 85.7572 217.724 80.8783C218.745 76.8316 220.044 72.5449 221.36 68.2009C221.632 67.3033 221.905 66.4031 222.176 65.5022C223.764 60.2261 225.302 54.9088 226.364 49.7943C228.502 39.4944 228.625 30.3587 223.714 24.1186C210.1 6.81929 189.576 1.46081 166.205 3.29133C142.819 5.12297 116.744 14.1494 92.3233 25.4197C67.9165 36.6833 45.2328 50.1544 28.6453 60.8145C20.3533 66.1434 13.5884 70.7675 8.89784 74.0583C6.55263 75.7037 4.72618 77.0156 3.48688 77.9156C2.86724 78.3656 2.3944 78.7125 2.07691 78.9467C1.91817 79.0638 1.79826 79.1526 1.71827 79.2121L1.62834 79.279L1.60608 79.2956L1.60066 79.2996Z" fill="black"/>
                        </svg>
                    </div>
                </div>
                <div className="textStyles">
                    <div className="textInsides">
                        <div className="row align-items-center justify-content-center">
                            <div className="col-4 col-2">
                                <h1 style={{fontFamily:"Big Shoulders Inline Display"}}>
                                    BERLIN
                                </h1>
                            </div>
                            <div className="col-4 col-2">
                                <h1 style={{fontFamily:"Berkshire Swash"}}>
                                    JAPAN
                                </h1>
                            </div>
                            <div className="col-4 col-2">
                                <h1 style={{fontFamily:"Bodoni Moda"}}>
                                    GERMANY
                                </h1>
                            </div>
                            <div className="col-4 col-2">
                                <h1 style={{fontFamily:"Boogaloo"}}>
                                    UKRAINIAN
                                </h1>
                            </div>
                            <div className="col-4 col-2">
                                <h1 style={{fontFamily:"Bungee"}}>
                                    MARSHALL
                                </h1>
                            </div>
                        </div>
                        <div className="row align-items-center justify-content-center">
                            <div className="col-4 col-2">
                                <h1 style={{fontFamily:"Cinzel"}}>
                                    EGYPT
                                </h1>
                            </div>
                            <div className="col-4 col-2">
                                <h1 style={{fontFamily:"Dorsa"}}>
                                    INDIA
                                </h1>
                            </div>
                            <div className="col-4 col-2">
                                <h1 style={{fontFamily:"Kings"}}>
                                    RUSSIA
                                </h1>
                            </div>
                            <div className="col-4 col-2">
                                <h1 style={{fontFamily:"Trochut"}}>
                                    PHILIPPINES
                                </h1>
                            </div>
                            <div className="col-4 col-2">
                                <div className="row">
                                    <div className="col">
                                        <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0 25C0 18.3696 2.63392 12.0107 7.32233 7.32233C12.0107 2.63392 18.3696 0 25 0C31.6304 0 37.9893 2.63392 42.6777 7.32233C47.3661 12.0107 50 18.3696 50 25C50 31.6304 47.3661 37.9893 42.6777 42.6777C37.9893 47.3661 31.6304 50 25 50C18.3696 50 12.0107 47.3661 7.32233 42.6777C2.63392 37.9893 0 31.6304 0 25ZM18.45 16.2406C18.3059 16.0914 18.1335 15.9724 17.9428 15.8905C17.7522 15.8086 17.5472 15.7655 17.3397 15.7637C17.1322 15.7619 16.9265 15.8014 16.7344 15.88C16.5424 15.9585 16.368 16.0746 16.2213 16.2213C16.0746 16.368 15.9585 16.5424 15.88 16.7344C15.8014 16.9265 15.7619 17.1322 15.7637 17.3397C15.7655 17.5472 15.8086 17.7522 15.8905 17.9428C15.9724 18.1335 16.0914 18.3059 16.2406 18.45L29.0406 31.25H20.3906C19.9762 31.25 19.5788 31.4146 19.2858 31.7076C18.9927 32.0007 18.8281 32.3981 18.8281 32.8125C18.8281 33.2269 18.9927 33.6243 19.2858 33.9174C19.5788 34.2104 19.9762 34.375 20.3906 34.375H32.8125C33.2269 34.375 33.6243 34.2104 33.9174 33.9174C34.2104 33.6243 34.375 33.2269 34.375 32.8125V20.3906C34.375 19.9762 34.2104 19.5788 33.9174 19.2858C33.6243 18.9927 33.2269 18.8281 32.8125 18.8281C32.3981 18.8281 32.0007 18.9927 31.7076 19.2858C31.4146 19.5788 31.25 19.9762 31.25 20.3906V29.0406L18.45 16.2406Z" fill="black"/>
                                        </svg>
                                    </div>
                                    <div className="col">
                                        <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd" clip-rule="evenodd" d="M3.125 25C3.125 30.8016 5.42968 36.3656 9.53204 40.468C13.6344 44.5703 19.1984 46.875 25 46.875C30.8016 46.875 36.3656 44.5703 40.468 40.468C44.5703 36.3656 46.875 30.8016 46.875 25C46.875 19.1984 44.5703 13.6344 40.468 9.53204C36.3656 5.42968 30.8016 3.125 25 3.125C19.1984 3.125 13.6344 5.42968 9.53204 9.53204C5.42968 13.6344 3.125 19.1984 3.125 25ZM50 25C50 31.6304 47.3661 37.9893 42.6777 42.6777C37.9893 47.3661 31.6304 50 25 50C18.3696 50 12.0107 47.3661 7.32233 42.6777C2.63392 37.9893 0 31.6304 0 25C0 18.3696 2.63392 12.0107 7.32233 7.32233C12.0107 2.63392 18.3696 0 25 0C31.6304 0 37.9893 2.63392 42.6777 7.32233C47.3661 12.0107 50 18.3696 50 25ZM18.2938 16.0812C18.0004 15.7879 17.6024 15.623 17.1875 15.623C16.7726 15.623 16.3746 15.7879 16.0812 16.0812C15.7879 16.3746 15.623 16.7726 15.623 17.1875C15.623 17.6024 15.7879 18.0004 16.0812 18.2938L28.8844 31.0938H20.2344C19.82 31.0938 19.4225 31.2584 19.1295 31.5514C18.8365 31.8444 18.6719 32.2418 18.6719 32.6562C18.6719 33.0707 18.8365 33.4681 19.1295 33.7611C19.4225 34.0541 19.82 34.2188 20.2344 34.2188H32.6562C33.0707 34.2188 33.4681 34.0541 33.7611 33.7611C34.0541 33.4681 34.2188 33.0707 34.2188 32.6562V20.2344C34.2188 19.82 34.0541 19.4225 33.7611 19.1295C33.4681 18.8365 33.0707 18.6719 32.6562 18.6719C32.2418 18.6719 31.8444 18.8365 31.5514 19.1295C31.2584 19.4225 31.0938 19.82 31.0938 20.2344V28.8844L18.2938 16.0812Z" fill="black"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    )
}

export default Type1