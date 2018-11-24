import React from "react";
import styled, { css, keyframes } from "styled-components";
import mojs from "mo-js";
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'

const shockwave = keyframes`
  0% {
    box-shadow:0 0 rgba(0,128,0,0.1);
  }
  70% {
    box-shadow:0 0 5px 10px rgba(0,128,0,0.75);
  }
  100% {
    box-shadow:0 0 0 0 rgba(0,128,0,0.75);
  }
`;

const ClapButtonWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 140px;
  height: auto;
`;

const ClapButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border-radius: 50px;
  border: 1px solid #cacaca;
  background: transparent;
  transition-delay: 20ms;
  -webkit-tap-highlight-color: transparent;
  outline: none;
  transition: all 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    box-shadow: 0 0 2px green;
    animation: ${shockwave} 2s infinite;
  }

  &:active {
    box-shadow: none;
    animation: none;
  }

  ${props =>
    props.isClapping &&
    css`
      border: 3px solid green;
      box-shadow: none;
      transform: scale(1.2);
    `}
`;

const HandIcon = styled.span`
  width: 50px;
  font-size: 2rem;
  color: green;
  ${props =>
    props.clapped &&
    css`
      color: green;
    `}
`;

const ClapCount = styled.div`
  font-size: 12px;
  color: gray;
  padding: 4px;
  margin: 8px;
  display: flex;
  transition: all 0.2s ease-in-out;

  ${props =>
    props.isClapping &&
    css`
      opacity: 0;
      color: green;
    `}

  ${props =>
    !props.isClapping &&
    css`
      opacity: 1;
    `}
`;

const ClearClaps = styled.button`
  font-size: 12px;
  color: gray;
  padding: 4px;
  margin: 8px;
  background: transparent;
  border: none;
  visibility: hidden;
  cursor: pointer;
  ${props =>
    props.clapped &&
    css`
      visibility: visible;
    `}
`;

const ClapsSessionCount = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgb(0, 128, 0);
  color: #fff;
  font-size: 16px;
  padding: 4px;
  position: relative;
  top: 0px;
  transition: all 0.2s ease-in-out;

  ${props =>
    props.isClapping &&
    css`
      transform: translateY(-30px);
      opacity: 1;
    `}

  ${props =>
    !props.isClapping &&
    css`
      transform: translateY(-80px);
      opacity: 0;
    `}
`;

class ClapButtonContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userClaps: 0,
      totalClaps: 100,
      clapsInARow: 0,
      isClapped: false,
      isClapping: false,
    };
    this.clapButton = React.createRef();
  }

  handleClearClaps = async (e) => {
    e.preventDefault();
    this.setState(
      prevState => ({
        isClapped: false,
        userClaps: 0,
        totalClaps: prevState.totalClaps - prevState.userClaps,
        clapsInARow: 0
      })
    );
  };

  handleClap = async () => {
    setTimeout(() => {
      this.setState({
        isClapping: false
      });
    }, 100);

    this.setState(prevState => ({
      userClaps: prevState.userClaps + 1,
      totalClaps: prevState.totalClaps + 1,
      isClapped: true,
      isClapping: true
    }), () => {
      this.handleBurstAnimation()
    });
  };

  handleSingleClap = async (e) => {
    e.preventDefault();
    this.handleClap();
  };

  handleRepeatClapStart = async (e) => {
    this.clapRepeatTimer = setInterval(() => {
      this.handleClap();
      this.addClapSession();
    }, 100);
  };

  handleRepeatClapEnd = async (e) => {
    e.preventDefault();
    clearInterval(this.clapRepeatTimer);
    this.removeClapsSession();
  };

  addClapSession = async () => {
    this.setState(prevState => ({
      clapsInARow: prevState.clapsInARow + 1
    }));
  };

  removeClapsSession = debounce(async () => {
    setTimeout(() => {
      this.setState({
        clapsInARow: 0
      });
    }, 100);
  },10);

  componentDidMount() {

    this.getClapsData()

    const clapBtn = this.clapButton.current;
    clapBtn.addEventListener("mousedown", this.handleRepeatClapStart);
    clapBtn.addEventListener("mouseup", this.handleRepeatClapEnd);
    clapBtn.addEventListener("click", this.handleSingleClap);
  }

  componentWillUnmount() {
    const clapBtn = this.clapButton.current;
    clapBtn.removeEventListener("mousedown", this.handleRepeatClapStart);
    clapBtn.removeEventListener("mouseup", this.handleRepeatClapEnd);
    clapBtn.removeEventListener("click", this.handleSingleClap);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.userClaps !== this.state.userClaps) {
      this.postClapsData()
    }
  }

  getClapsData = async () => {
    console.log("GET claps from API: ", this.state.totalClaps);
  }

  postClapsData = debounce(async () => {
    console.log("POST claps to API: ", this.state.userClaps);
  }, 100);

  handleBurstAnimation = throttle(() => {
    const circleBurst = new mojs.Burst({
      parent: '#clapButton',
      radius: {50:100},
      angle: { 0: 25 },
      count: 10,
      origin: '50% 50%',
      children: {
        shape: ['circle', 'polygon'],
        fill: [ 'green', 'orange' ],
        delay: 100,
        isShowEnd: false,
        speed: 0.2,
        radius: {3: 0},
        easing: mojs.easing.bezier(0.1, 1, 0.3, 1),
        degreeShift: 'rand(25, 360)',
      }
    })

    circleBurst.replay();
  }, 300)


  render() {
    const {
      userClaps,
      isClapped,
      isClapping,
      totalClaps,
      clapsInARow
    } = this.state;

    const iconStyle = {
      fill: isClapped ? "green" : "transparent",
      stroke: "green"
    };

    return (
      <ClapButtonWrap>
        <ClapCount isClapping={isClapping}>{totalClaps}</ClapCount>
        <ClapsSessionCount isClapping={clapsInARow !== 0}>
          +{clapsInARow}
        </ClapsSessionCount>
        <ClapButton
          isClapping={isClapping}
          clapped={isClapped}
          ref={this.clapButton}
          id='clapButton'
        >
          <HandIcon role="img" aria-label="clap" clapped={isClapped}>
            <svg
              id="clap--icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="-549 338 100.1 125"
              style={iconStyle}
            >
              <path d="M-471.2 366.8c1.2 1.1 1.9 2.6 2.3 4.1.4-.3.8-.5 1.2-.7 1-1.9.7-4.3-1-5.9-2-1.9-5.2-1.9-7.2.1l-.2.2c1.8.1 3.6.9 4.9 2.2zm-28.8 14c.4.9.7 1.9.8 3.1l16.5-16.9c.6-.6 1.4-1.1 2.1-1.5 1-1.9.7-4.4-.9-6-2-1.9-5.2-1.9-7.2.1l-15.5 15.9c2.3 2.2 3.1 3 4.2 5.3zm-38.9 39.7c-.1-8.9 3.2-17.2 9.4-23.6l18.6-19c.7-2 .5-4.1-.1-5.3-.8-1.8-1.3-2.3-3.6-4.5l-20.9 21.4c-10.6 10.8-11.2 27.6-2.3 39.3-.6-2.6-1-5.4-1.1-8.3z" />
              <path d="M-527.2 399.1l20.9-21.4c2.2 2.2 2.7 2.6 3.5 4.5.8 1.8 1 5.4-1.6 8l-11.8 12.2c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l34-35c1.9-2 5.2-2.1 7.2-.1 2 1.9 2 5.2.1 7.2l-24.7 25.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l28.5-29.3c2-2 5.2-2 7.1-.1 2 1.9 2 5.1.1 7.1l-28.5 29.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.4 1.7 0l24.7-25.3c1.9-2 5.1-2.1 7.1-.1 2 1.9 2 5.2.1 7.2l-24.7 25.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l14.6-15c2-2 5.2-2 7.2-.1 2 2 2.1 5.2.1 7.2l-27.6 28.4c-11.6 11.9-30.6 12.2-42.5.6-12-11.7-12.2-30.8-.6-42.7m18.1-48.4l-.7 4.9-2.2-4.4m7.6.9l-3.7 3.4 1.2-4.8m5.5 4.7l-4.8 1.6 3.1-3.9" />
            </svg>
          </HandIcon>
        </ClapButton>

        <ClearClaps clapped={isClapped} onClick={this.handleClearClaps}>
          <span> Clear {userClaps} claps</span>
        </ClearClaps>
      </ClapButtonWrap>
    );
  }
}

export default ClapButtonContainer;
