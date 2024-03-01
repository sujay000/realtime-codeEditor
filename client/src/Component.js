/**
 * v0 by Vercel.
 * @see https://v0.dev/t/jaKKV06m8r2
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Component() {
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-green-400 to-blue-400">
            <div className="flex flex-col w-3/4 p-8 space-y-6">
                <div className="flex flex-col">
                    <label className="mb-2 text-lg font-semibold text-white" htmlFor="codeArea">
                        Code Area
                    </label>
                    <Textarea
                        className="h-64 p-4 border rounded-md bg-white text-gray-800"
                        id="codeArea"
                        placeholder="// Write your C++ code here"
                    />
                </div>
                <div className="flex space-x-6">
                    <div className="flex flex-col w-1/2">
                        <label className="mb-2 text-lg font-semibold text-white" htmlFor="input">
                            Input
                        </label>
                        <Textarea
                            className="h-32 p-4 border rounded-md bg-white text-gray-800"
                            id="input"
                            placeholder="Enter input for the code"
                        />
                    </div>
                    <div className="flex flex-col w-1/2">
                        <label className="mb-2 text-lg font-semibold text-white" htmlFor="output">
                            Output
                        </label>
                        <Textarea
                            className="h-32 p-4 border rounded-md bg-white text-gray-800"
                            id="output"
                            placeholder="See the output here"
                        />
                    </div>
                </div>
                <Button className="self-start bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
                    RUN
                </Button>
            </div>
            <div className="flex flex-col w-1/4 p-8 space-y-6 bg-green-200 border-l border-green-300">
                <div className="flex flex-col">
                    <h2 className="text-xl font-semibold text-green-800 mb-4">Video Call</h2>
                    <div className="flex flex-col space-y-2">
                        <p className="text-sm text-green-800">
                            Start a video call with your friend. Share your id with them
                        </p>
                        <Input
                            className="cursor-not-allowed bg-white text-gray-800"
                            readOnly
                            type="text"
                            value="V-VNaM1JdmzqghlgHAAKZ"
                        />
                    </div>
                    <Button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        start my video and audio
                    </Button>
                    <div className="flex flex-col mt-4">
                        <label className="mb-2 text-lg font-semibold text-green-800" htmlFor="videoCallId">
                            Enter id
                        </label>
                        <Input id="videoCallId" placeholder="Enter friend's ID" />
                        <Button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            call user
                        </Button>
                    </div>
                </div>
                <div className="flex space-x-4">
                    <div className="flex-1 bg-yellow-300 h-48 rounded-md" />
                    <div className="flex-1 bg-yellow-300 h-48 rounded-md" />
                </div>
            </div>
        </div>
    )
}
