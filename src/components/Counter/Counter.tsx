type Props = {
    value: number
};

function Counter(props: Props)
{
    function getValueToDisplay() : string
    {
        return props.value.toString();
    }

    return(
        <div className="Counter">
            <b>{getValueToDisplay()}</b>
        </div>
    );
}

export default Counter;